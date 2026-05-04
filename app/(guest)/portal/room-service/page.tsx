import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import {
  getGuestRoomServiceOrders,
  type OrderItem,
} from '@/lib/actions/room-service-orders'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  pending:   { label: 'Pending',   variant: 'outline' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export default async function GuestRoomServicePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  if (!token) redirect('/login')

  const guest = await verifyGuestToken(token)
  if (!guest) redirect('/login')

  const orders = await getGuestRoomServiceOrders(guest.reservationCode)

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
      {orders.map((order) => {
        const items = JSON.parse(order.items) as OrderItem[]
        const status = STATUS_CONFIG[order.status] ?? { label: order.status, variant: 'outline' as const }

        return (
          <Card key={order.id}>
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), 'MMM d, yyyy · HH:mm')}
                  </p>
                </div>
                <Badge variant={status.variant} className="shrink-0 mt-0.5">
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 space-y-3">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name}
                      <span className="ml-1 font-medium text-foreground">× {item.quantity}</span>
                    </span>
                    <span className="font-medium tabular-nums">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="text-xs text-muted-foreground border-t pt-2 italic">
                  "{order.note}"
                </p>
              )}

              <div className="flex justify-end border-t pt-2">
                <span className="text-sm font-semibold">
                  Total: €{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
