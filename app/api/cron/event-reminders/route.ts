// Scheduler target (external cron, e.g. cron-job.org every 15 min — the Vercel
// Hobby plan caps native crons at once per day): pushes a "starting soon"
// reminder to every in-house guest for events beginning within the next
// REMINDER_LEAD_MINUTES. Callers must send `Authorization: Bearer ${CRON_SECRET}`;
// with no secret set the route refuses to run (fail-closed). If the project
// moves to Vercel Pro, a vercel.json cron entry works as-is with the same header.
import { NextResponse } from 'next/server'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { nowHotelMinutes, toHotelDateISO, todayISO } from '@/lib/dates'
import { sendPushToActiveGuests, type PushPayload } from '@/lib/push'
import { eventReminderPush } from '@/lib/push-messages'
import { getTranslationMap, type TranslationMap } from '@/lib/translations'
import { LOCALES } from '@/i18n/routing'

const REMINDER_LEAD_MINUTES = 60
const DAY_MINUTES = 24 * 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = todayISO()
  // Tomorrow too, so a 23:xx run still catches events starting shortly after midnight.
  const tomorrow = toHotelDateISO(new Date(Date.now() + DAY_MINUTES * 60 * 1000))
  const nowMinutes = nowHotelMinutes()

  const candidates = await db
    .select()
    .from(events)
    .where(and(isNull(events.reminderSentAt), inArray(events.date, [today, tomorrow])))

  const due = candidates.filter((event) => {
    const [hours, minutes] = event.startTime.split(':').map(Number)
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false
    let untilStart = hours * 60 + minutes - nowMinutes
    if (event.date === tomorrow) untilStart += DAY_MINUTES
    return untilStart > 0 && untilStart <= REMINDER_LEAD_MINUTES
  })

  if (due.length === 0) return NextResponse.json({ sent: 0 })

  // Guests see the event title/location in their language when the admin has
  // entered translations; otherwise the English base inside a localized sentence.
  const translationMaps = new Map<string, TranslationMap>()
  for (const locale of LOCALES) {
    if (locale === 'en') continue
    translationMaps.set(locale, await getTranslationMap('event', locale))
  }

  for (const event of due) {
    const payloads: Partial<Record<string, PushPayload>> = {}
    for (const locale of LOCALES) {
      const translated = translationMaps.get(locale)?.get(event.id)
      payloads[locale] = eventReminderPush(
        locale,
        translated?.title ?? event.title,
        event.startTime,
        translated?.location ?? event.location,
      )
    }
    await sendPushToActiveGuests(payloads)
    // Mark as sent even if delivery partially failed — push is best-effort and
    // retrying the whole broadcast would double-notify the successful devices.
    await db.update(events).set({ reminderSentAt: new Date() }).where(eq(events.id, event.id))
  }

  return NextResponse.json({ sent: due.length, eventIds: due.map((event) => event.id) })
}
