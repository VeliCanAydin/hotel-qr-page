import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { GuestFeedbackForm } from '@/components/ui/guest/guest-feedback-form'

export default async function GuestFeedbackPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect('/login')

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect('/login')

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect('/login')

  return (
    <GuestFeedbackForm
      guestName={reservation.guestName}
      roomNumber={reservation.roomNumber}
    />
  )
}
