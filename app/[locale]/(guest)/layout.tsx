import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { Toaster } from '@/components/ui/sonner'

// Session check reads cookies + DB, so it renders inside <Suspense>; pages
// under it are covered by the same boundary. Redirects target the localized
// login (/{locale}/login) to avoid a middleware redirect hop (tuzak #9).
async function GuestGate({ locale, children }: { locale: string; children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) redirect(`/${locale}/login`)

  const guestPayload = await verifyGuestToken(token)
  if (!guestPayload) redirect(`/${locale}/login`)

  const reservation = await findActiveReservation(guestPayload.reservationCode)
  if (!reservation) redirect(`/${locale}/login`)

  return <>{children}</>
}

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Suspense>
        <GuestGate locale={locale}>{children}</GuestGate>
      </Suspense>
      <Toaster richColors position="bottom-right" />
    </>
  )
}
