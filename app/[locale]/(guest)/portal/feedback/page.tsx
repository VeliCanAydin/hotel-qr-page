import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { GuestFeedbackForm } from '@/components/guest/guest-feedback-form'

export default async function GuestFeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect(`/${locale}/login`)

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect(`/${locale}/login`)

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect(`/${locale}/login`)

  return (
    <GuestFeedbackForm
      guestName={reservation.guestName}
      roomNumber={reservation.roomNumber}
    />
  )
}
