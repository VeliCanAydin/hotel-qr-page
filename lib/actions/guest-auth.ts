'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { findReservationForLogin } from '@/lib/reservations'
import { signGuestToken, verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { LOCALES } from '@/i18n/routing'

const isKnownLocale = (value: string) => (LOCALES as readonly string[]).includes(value)

// `error` is a key in the `errors` messages namespace — the client translates it.
export type GuestLoginState = { error: string; redirectTo?: string }

export async function guestLogin(
  prevState: GuestLoginState,
  formData: FormData
): Promise<GuestLoginState> {
  const roomNumber = (formData.get('roomNumber') as string)?.trim()
  const surname = (formData.get('surname') as string)?.trim()
  // Only allow same-site relative paths ('/...' but not '//host' or '/\host')
  // to prevent open redirects to external sites after login.
  const rawRedirect = (formData.get('redirect') as string)?.trim() || '/'
  const redirectPath =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
      ? rawRedirect
      : '/'

  if (!roomNumber || !surname) {
    return { error: 'missingCredentials' }
  }

  const reservation = await findReservationForLogin(roomNumber, surname)

  if (!reservation) {
    return { error: 'reservationNotFound' }
  }

  // Remember the guest's UI language for push notifications (lib/push-messages.ts).
  const locale = (formData.get('locale') as string)?.trim()
  if (locale && isKnownLocale(locale) && locale !== reservation.locale) {
    await db.update(reservations).set({ locale }).where(eq(reservations.id, reservation.id))
  }

  const token = await signGuestToken({
    roomNumber: reservation.roomNumber,
    surname: reservation.surname,
    reservationCode: reservation.reservationCode,
    checkOut: reservation.checkOut,
  })

  const cookieStore = await cookies()
  cookieStore.set(GUEST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return { error: '', redirectTo: redirectPath }
}

export async function guestLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(GUEST_SESSION_COOKIE)
  redirect('/')
}

/**
 * Keep the reservation's push-notification language in sync when a logged-in
 * guest switches languages. Safe as a public action: the reservation comes
 * from the verified session and only its own locale column is written; without
 * a session this is a no-op.
 */
export async function syncGuestLocale(locale: string): Promise<void> {
  if (!isKnownLocale(locale)) return

  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const guest = token ? await verifyGuestToken(token) : null
  if (!guest) return

  await db
    .update(reservations)
    .set({ locale })
    .where(eq(reservations.reservationCode, guest.reservationCode))
}
