import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { Toaster } from '@/components/ui/sonner'

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) redirect('/login')

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect('/login')

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect('/login')

  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
    </>
  )
}
