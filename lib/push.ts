// Web push sender. Server-only module, deliberately NOT a server action —
// exposing send helpers as actions would let anyone push to any reservation.
import webpush from 'web-push'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/db/schema'

export type PushPayload = {
  title: string
  body: string
  url: string
}

let vapidConfigured: boolean | null = null

function ensureVapid(): boolean {
  if (vapidConfigured !== null) return vapidConfigured
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) {
    console.warn('[push] VAPID env vars missing — push notifications disabled')
    vapidConfigured = false
    return false
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

/** Sends to every device subscribed for the stay. Never throws — push is a
 *  best-effort side effect of staff actions. Expired subscriptions (404/410
 *  from the push service) are pruned. */
export async function sendPushToReservation(
  reservationCode: string,
  payload: PushPayload
): Promise<void> {
  try {
    if (!ensureVapid()) return

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.reservationCode, reservationCode))
    if (!subscriptions.length) return

    const body = JSON.stringify(payload)
    const gone: number[] = []

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body
          )
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            gone.push(sub.id)
          } else {
            console.error(`[push] send failed for ${reservationCode}:`, err)
          }
        }
      })
    )

    if (gone.length) {
      await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, gone))
    }
  } catch (err) {
    console.error('[push] sendPushToReservation failed:', err)
  }
}

/** Check-out cleanup — the stay is over, its devices should stop receiving. */
export async function deletePushSubscriptionsForReservation(
  reservationCode: string
): Promise<void> {
  try {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.reservationCode, reservationCode))
  } catch (err) {
    console.error('[push] subscription cleanup failed:', err)
  }
}
