import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/data/mockReservations'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ guest: null })
    }

    const payload = await verifyGuestToken(token)
    if (!payload) {
      return NextResponse.json({ guest: null })
    }

    const reservation = findActiveReservation(payload.reservationCode)
    if (!reservation) {
      return NextResponse.json({ guest: null })
    }

    return NextResponse.json({
      guest: {
        guestName: reservation.guestName,
        roomNumber: reservation.roomNumber,
      },
    })
  } catch (error) {
    console.error('[guest-context] error:', error)
    return NextResponse.json({ guest: null }, { status: 500 })
  }
}
