import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { GuestHeader } from '@/components/guest/guest-header'
import { PortalTabs } from '@/components/guest/portal-tabs'
import { Badge } from '@/components/ui/badge'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  confirmed: 'outline',
  'checked-in': 'default',
  'checked-out': 'secondary',
}

// Reads the guest session (cookies + DB), so it renders inside the layout's
// <Suspense> boundary; portal pages are covered by the same boundary.
async function PortalShell({
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
    <div className="min-h-screen">
      <GuestHeader reservation={reservation} />
      <main className="container max-w-lg mx-auto px-4 pt-6 pb-8 space-y-4">
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <p className="text-xs text-muted-foreground pb-1">Welcome back</p>
            <h1 className="text-xl font-semibold leading-tight">{reservation.guestName}</h1>
          </div>
          <Badge variant={STATUS_VARIANTS[reservation.status]} className="shrink-0 mt-0.5">
            {STATUS_LABELS[reservation.status]}
          </Badge>
        </div>

        <PortalTabs />

        <div className="pt-1">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  )
}
