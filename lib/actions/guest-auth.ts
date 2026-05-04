'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { findReservation } from '@/lib/data/mockReservations'
import { signGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'

export type GuestLoginState = { error: string; redirectTo?: string }

export async function guestLogin(
  prevState: GuestLoginState,
  formData: FormData
): Promise<GuestLoginState> {
  const roomNumber = (formData.get('roomNumber') as string)?.trim()
  const surname = (formData.get('surname') as string)?.trim()
  const redirectPath = (formData.get('redirect') as string)?.trim() || '/'

  if (!roomNumber || !surname) {
    return { error: 'Room number and surname are required.' }
  }

  const reservation = findReservation(roomNumber, surname)

  if (!reservation) {
    return { error: 'No reservation found. Please check your room number and surname.' }
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
