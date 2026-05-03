import { cookies } from 'next/headers'
import Header from "@/components/Header";
import FooterWrapper from "@/components/FooterWrapper";
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/data/mockReservations'

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  let guestInfo: { guestName: string; roomNumber: string } | undefined

  if (token) {
    const payload = await verifyGuestToken(token)
    if (payload) {
      const reservation = findActiveReservation(payload.reservationCode)
      if (reservation) {
        guestInfo = {
          guestName: reservation.guestName,
          roomNumber: reservation.roomNumber,
        }
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header guestInfo={guestInfo} />
      <main className="flex-1">
        {children}
      </main>
      <FooterWrapper />
    </div>
  );
}
