'use server'

import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/db/schema'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'

export type PushSubscriptionInput = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

async function getActiveGuestReservation() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const guest = token ? await verifyGuestToken(token) : null
  if (!guest) return null
  return findActiveReservation(guest.reservationCode)
}

export async function subscribeToPush(
  sub: PushSubscriptionInput
): Promise<{ ok: true } | { error: string }> {
  const reservation = await getActiveGuestReservation()
  if (!reservation) return { error: 'Your session has expired. Please sign in again.' }

  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { error: 'Invalid subscription.' }
  }
  if (!sub.endpoint.startsWith('https://')) {
    return { error: 'Invalid subscription.' }
  }

  // Same device re-subscribing (e.g. a returning guest on a new stay) moves
  // the endpoint to the current reservation instead of erroring on the
  // unique constraint.
  await db
    .insert(pushSubscriptions)
    .values({
      reservationCode: reservation.reservationCode,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        reservationCode: reservation.reservationCode,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    })

  return { ok: true }
}

export async function unsubscribeFromPush(
  endpoint: string
): Promise<{ ok: true } | { error: string }> {
  const reservation = await getActiveGuestReservation()
  if (!reservation) return { error: 'Your session has expired. Please sign in again.' }

  // Scoped to the caller's own reservation — a guest can't delete another
  // stay's subscriptions even with a stolen endpoint URL.
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.reservationCode, reservation.reservationCode)
      )
    )

  return { ok: true }
}
