import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { getGuestRoomServiceOrders } from '@/lib/actions/room-service-orders'
import { Card, CardContent } from '@/components/ui/card'
import { UtensilsCrossed } from 'lucide-react'
import GuestOrderCard from './order-card'

export default async function GuestRoomServicePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect(`/${locale}/login`)

  const guest = await verifyGuestToken(token)
  if (!guest) redirect(`/${locale}/login`)

  const orders = await getGuestRoomServiceOrders()

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground max-w-55">
              Your room service orders will appear here once you place them.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <GuestOrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
