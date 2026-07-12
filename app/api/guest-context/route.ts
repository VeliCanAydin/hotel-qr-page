import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyGuestToken, verifyToken, GUEST_SESSION_COOKIE, SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'

export async function GET() {
  // Outside the try: during prerender cookies() rejects with a control-flow
  // sentinel that must not be swallowed by the catch below.
  const cookieStore = await cookies()

  try {
    // 1. Check admin/staff session
    const adminToken = cookieStore.get(SESSION_COOKIE)?.value
    if (adminToken) {
      const payload = await verifyToken(adminToken)
      if (payload) {
        return NextResponse.json({
          guest: {
            guestName: 'Staff',
            roomNumber: 'Staff',
            isStaff: true,
          },
        })
      }
    }

    // 2. Check guest session
    const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ guest: null })
    }

    const payload = await verifyGuestToken(token)
    if (!payload) {
      return NextResponse.json({ guest: null })
    }

    const reservation = await findActiveReservation(payload.reservationCode)
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
