import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/data/mockReservations'
import { GuestSidebar } from '@/components/ui/guest/guest-sidebar'
import { GuestBreadcrumb } from '@/components/ui/guest/guest-breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

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

  const reservation = findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect('/login')

  return (
    <SidebarProvider>
      <GuestSidebar reservation={reservation} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <GuestBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  )
}
