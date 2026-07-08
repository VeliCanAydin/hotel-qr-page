"use server"

import { and, desc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { db } from '@/lib/db'
import { guestSupportRequests } from '@/lib/db/schema'
import { requireAdmin, verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation, findActiveReservationByRoom } from '@/lib/reservations'
import { sendPushToReservation } from '@/lib/push'

export type GuestSupportRequest = typeof guestSupportRequests.$inferSelect

export type GuestSupportRequestInput = {
  guestName?: string
  roomNumber?: string
  requestType: 'support' | 'complaint'
  issueCategory: string
  subject: string
  message: string
  imageUrl: string
}

export async function createGuestSupportRequest(input: GuestSupportRequestInput) {
  await db.insert(guestSupportRequests).values({
    guestName: input.guestName?.trim() ?? '',
    roomNumber: input.roomNumber?.trim() ?? '',
    requestType: input.requestType,
    issueCategory: input.issueCategory,
    subject: input.subject.trim(),
    message: input.message.trim(),
    imageUrl: input.imageUrl.trim(),
    status: 'open',
    staffResponse: '',
    staffResponseBy: '',
    staffResponseAt: null,
  })
}

// One-tap housekeeping/front-desk requests from the portal. Keyed templates —
// the client sends only a key + optional note; room and guest name come from
// the verified session, never from the caller.
const QUICK_REQUEST_TEMPLATES = {
  towels: {
    category: 'housekeeping',
    subject: 'Extra towels',
    message: 'The guest requested extra towels for their room.',
  },
  cleaning: {
    category: 'housekeeping',
    subject: 'Room cleaning',
    message: 'The guest requested their room to be cleaned.',
  },
  toiletries: {
    category: 'housekeeping',
    subject: 'Toiletries refill',
    message: 'The guest requested a refill of bathroom toiletries.',
  },
  'late-checkout': {
    category: 'reception',
    subject: 'Late checkout request',
    message: 'The guest asked whether a late checkout is possible.',
  },
} as const

export type QuickRequestKey = keyof typeof QUICK_REQUEST_TEMPLATES

// `error` values are keys in the `errors` messages namespace — the client translates them.
export async function createGuestQuickRequest(
  key: QuickRequestKey,
  note?: string
): Promise<{ ok: true } | { error: string }> {
  const template = QUICK_REQUEST_TEMPLATES[key]
  if (!template) return { error: 'unknownRequestType' }

  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const guest = token ? await verifyGuestToken(token) : null
  if (!guest) return { error: 'sessionExpired' }

  const reservation = await findActiveReservation(guest.reservationCode)
  if (!reservation) return { error: 'stayEnded' }

  // One open request per type per room — resubmitting won't flood the staff queue.
  const [existing] = await db
    .select({ id: guestSupportRequests.id })
    .from(guestSupportRequests)
    .where(
      and(
        eq(guestSupportRequests.roomNumber, reservation.roomNumber),
        eq(guestSupportRequests.subject, template.subject),
        eq(guestSupportRequests.status, 'open')
      )
    )
    .limit(1)
  if (existing) {
    return { error: 'requestAlreadyOpen' }
  }

  const trimmedNote = note?.trim().slice(0, 500)
  await db.insert(guestSupportRequests).values({
    guestName: reservation.guestName,
    roomNumber: reservation.roomNumber,
    requestType: 'support',
    issueCategory: template.category,
    subject: template.subject,
    message: trimmedNote ? `${template.message}\n\nGuest note: ${trimmedNote}` : template.message,
    imageUrl: '',
    status: 'open',
    staffResponse: '',
    staffResponseBy: '',
    staffResponseAt: null,
  })

  return { ok: true }
}

// Newest-first window — the admin screen starts with the most recent requests
// and loads older ones on demand so the query doesn't grow with history.
export async function getGuestSupportRequests(limit = 100): Promise<GuestSupportRequest[]> {
  await requireAdmin('/dashboard/guests/support-requests')
  try {
    return await db
      .select()
      .from(guestSupportRequests)
      .orderBy(desc(guestSupportRequests.createdAt))
      .limit(limit)
  } catch (err) {
    // If the table doesn't exist (dev environment without migrations), return empty list
    // and log error for visibility.
    // Caller pages should tolerate empty arrays.
    // eslint-disable-next-line no-console
    console.error('[getGuestSupportRequests] failed:', err)
    return []
  }
}

export async function countGuestSupportRequests(): Promise<number> {
  await requireAdmin('/dashboard/guests/support-requests')
  return db.$count(guestSupportRequests)
}

export type GuestSupportRequestUpdateInput = {
  staffResponse?: string
  status?: string
  staffResponseBy?: string
}

export async function updateGuestSupportRequest(
  requestId: number,
  input: GuestSupportRequestUpdateInput
): Promise<GuestSupportRequest | null> {
  await requireAdmin('/dashboard/guests/support-requests')
  const [updated] = await db
    .update(guestSupportRequests)
    .set({
      staffResponse: (input.staffResponse ?? '').trim(),
      status: input.status ?? 'open',
      staffResponseBy: input.staffResponseBy?.trim() ?? '',
      staffResponseAt: new Date(),
    })
    .where(eq(guestSupportRequests.id, requestId))
    .returning()

  // Requests only store a room number, so route the push through whoever
  // currently occupies that room. Runs after the response — staff shouldn't
  // wait on push-service HTTP.
  if (updated && updated.roomNumber) {
    after(async () => {
      const reservation = await findActiveReservationByRoom(updated.roomNumber)
      if (!reservation) return
      const response = updated.staffResponse.trim()
      await sendPushToReservation(reservation.reservationCode, {
        title: updated.status === 'resolved' ? 'Request resolved' : 'Request update',
        body: response
          ? `"${updated.subject}" — ${response.slice(0, 140)}`
          : `Your request "${updated.subject}" is being handled by our team.`,
        url: '/portal',
      })
    })
  }

  return updated ?? null
}
