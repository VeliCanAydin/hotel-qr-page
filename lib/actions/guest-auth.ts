'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { findReservationForLogin } from '@/lib/reservations'
import { signGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'

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
