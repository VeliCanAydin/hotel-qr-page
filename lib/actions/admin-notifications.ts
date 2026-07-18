'use server'

import { and, count, desc, eq, gte, lte, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { adminNotifications, pushSubscriptions, reservations } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'
import { todayISO } from '@/lib/dates'
import { sendPushToActiveGuests, sendPushToReservation, type PushPayload } from '@/lib/push'
import { toLocale } from '@/lib/push-messages'
import { LOCALES, type Locale } from '@/i18n/routing'

const NOTIFICATIONS_PAGE = '/dashboard/guests/notifications'

const TITLE_MAX = 100
const BODY_MAX = 500

export type NotificationText = { title: string; body: string }

export type CustomNotificationInput = {
  /** 'all' broadcasts to every in-house guest, otherwise a reservation code. */
  target: string
  /** Locale-less guest path the notification opens, e.g. '/portal' or '/events'. */
  path: string
  /** Per-language texts. `en` is required; missing languages fall back to `en`. */
  texts: Partial<Record<Locale, NotificationText>>
}

export type NotificationRecipient = {
  reservationCode: string
  roomNumber: string
  guestName: string
  surname: string
  locale: string
  deviceCount: number
}

export type SentNotification = {
  id: number
  title: string
  body: string
  url: string
  target: string
  targetLabel: string
  sentCount: number
  sentBy: string
  createdAt: Date
}

/** In-house reservations with their subscribed device counts — the target
 *  picker on the admin Notifications page. */
export async function getNotificationRecipients(): Promise<NotificationRecipient[]> {
  await requireAdmin(NOTIFICATIONS_PAGE)

  const today = todayISO()
  return db
    .select({
      reservationCode: reservations.reservationCode,
      roomNumber: reservations.roomNumber,
      guestName: reservations.guestName,
      surname: reservations.surname,
      locale: reservations.locale,
      deviceCount: count(pushSubscriptions.id),
    })
    .from(reservations)
    .leftJoin(
      pushSubscriptions,
      eq(pushSubscriptions.reservationCode, reservations.reservationCode)
    )
    .where(
      and(
        ne(reservations.status, 'checked-out'),
        lte(reservations.checkIn, today),
        gte(reservations.checkOut, today)
      )
    )
    .groupBy(reservations.id)
    .orderBy(reservations.roomNumber)
}

export async function getNotificationHistory(): Promise<SentNotification[]> {
  await requireAdmin(NOTIFICATIONS_PAGE)
  return db
    .select()
    .from(adminNotifications)
    .orderBy(desc(adminNotifications.createdAt))
    .limit(50)
}

function sanitizeText(text: NotificationText | undefined): NotificationText | null {
  const title = text?.title?.trim() ?? ''
  const body = text?.body?.trim() ?? ''
  if (!title && !body) return null
  if (!title || !body) throw new Error('Both title and body are required for a language')
  if (title.length > TITLE_MAX) throw new Error(`Title must be at most ${TITLE_MAX} characters`)
  if (body.length > BODY_MAX) throw new Error(`Body must be at most ${BODY_MAX} characters`)
  return { title, body }
}

/** Guest paths are locale-prefixed at send time — the stored path must be a
 *  plain internal path ('/portal', '/events/5'), never an absolute URL. */
function sanitizePath(path: string): string {
  const trimmed = path.trim()
  if (!/^\/[a-zA-Z0-9\-_/?=&#.]*$/.test(trimmed) || trimmed.startsWith('//')) {
    throw new Error('Destination must be an internal path starting with /')
  }
  return trimmed
}

export async function sendCustomNotification(
  input: CustomNotificationInput
): Promise<SentNotification> {
  const session = await requireAdmin(NOTIFICATIONS_PAGE)

  const en = sanitizeText(input.texts.en)
  if (!en) throw new Error('English title and body are required')
  const path = sanitizePath(input.path)

  // One payload per locale: text falls back to English when a language wasn't
  // filled in, but the deep link always carries the recipient's locale.
  const payloads: Partial<Record<string, PushPayload>> = {}
  for (const locale of LOCALES) {
    const text = locale === 'en' ? en : (sanitizeText(input.texts[locale]) ?? en)
    payloads[locale] = { title: text.title, body: text.body, url: `/${locale}${path}` }
  }

  let sentCount = 0
  let targetLabel = 'All in-house guests'

  if (input.target === 'all') {
    sentCount = await sendPushToActiveGuests(payloads)
  } else {
    const [reservation] = await db
      .select({
        reservationCode: reservations.reservationCode,
        roomNumber: reservations.roomNumber,
        guestName: reservations.guestName,
        locale: reservations.locale,
        status: reservations.status,
        checkOut: reservations.checkOut,
      })
      .from(reservations)
      .where(eq(reservations.reservationCode, input.target))
      .limit(1)
    if (!reservation) throw new Error('Reservation not found')
    if (reservation.status === 'checked-out' || reservation.checkOut < todayISO()) {
      throw new Error('This guest has already checked out')
    }

    targetLabel = `Room ${reservation.roomNumber} — ${reservation.guestName}`
    const payload = payloads[toLocale(reservation.locale)] ?? payloads.en!
    sentCount = await sendPushToReservation(reservation.reservationCode, payload)
  }

  const [logged] = await db
    .insert(adminNotifications)
    .values({
      title: en.title,
      body: en.body,
      url: path,
      target: input.target,
      targetLabel,
      sentCount,
      sentBy: session.email,
    })
    .returning()

  revalidatePath(NOTIFICATIONS_PAGE)
  return logged
}
