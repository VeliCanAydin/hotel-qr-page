import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { Toaster } from '@/components/ui/sonner'

// Session check reads cookies + DB, so it renders inside <Suspense>; pages
// under it are covered by the same boundary.
async function GuestGate({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) redirect('/login')

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect('/login')

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect('/login')

  return <>{children}</>
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense>
        <GuestGate>{children}</GuestGate>
      </Suspense>
      <Toaster richColors position="bottom-right" />
    </>
  )
}
