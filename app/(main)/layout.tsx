import { Suspense } from 'react'
import { cookies } from 'next/headers'
import Header from "@/components/header";
import FooterWrapper from "@/components/footer-wrapper";
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'

// Reads the guest session, so it must render inside <Suspense>; until it
// streams in, the fallback shows the same header without the guest chip.
async function SessionHeader() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  let guestInfo: { guestName: string; roomNumber: string } | undefined

  if (token) {
    const payload = await verifyGuestToken(token)
    if (payload) {
      const reservation = await findActiveReservation(payload.reservationCode)
      if (reservation) {
        guestInfo = {
          guestName: reservation.guestName,
          roomNumber: reservation.roomNumber,
        }
      }
    }
  }

  return <Header guestInfo={guestInfo} />
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Header />}>
        <SessionHeader />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <FooterWrapper />
    </div>
  );
}
