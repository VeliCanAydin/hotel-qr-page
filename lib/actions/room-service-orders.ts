'use server'

import { db } from '@/lib/db'
import { roomServiceOrders, roomServiceItems } from '@/lib/db/schema'
import { verifyGuestToken, requireAdmin, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { findActiveReservation } from '@/lib/reservations'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { desc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { sendPushToReservation } from '@/lib/push'

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

// `error` values are keys in the `errors` messages namespace — the client translates them.
export type CreateOrderResult =
  | { orderId: number }
  | { error: string; redirectTo?: string }

export async function createRoomServiceOrder(
  items: OrderItem[],
  note: string
): Promise<CreateOrderResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) {
    return { error: 'notAuthenticated', redirectTo: '/login?redirect=/room-service/cart' }
  }

  const guest = await verifyGuestToken(token)
  if (!guest) {
    return { error: 'sessionExpired', redirectTo: '/login?redirect=/room-service/cart' }
  }

  // The DB is the authority, not the token: this drops orders from guests who
  // were checked out mid-session, and delivers to the current room if the
  // guest moved after logging in.
  const reservation = await findActiveReservation(guest.reservationCode)
  if (!reservation) {
    return { error: 'stayEnded', redirectTo: '/login?redirect=/room-service/cart' }
  }

  if (!items.length) {
    return { error: 'cartEmpty' }
  }

  // Never trust client-side prices — rebuild every line from the catalog.
  const catalogRows = await db
    .select()
    .from(roomServiceItems)
    .where(inArray(roomServiceItems.id, items.map((item) => item.id)))
  const catalog = new Map(catalogRows.map((row) => [row.id, row]))

  const safeItems: OrderItem[] = []
  for (const item of items) {
    const catalogItem = catalog.get(item.id)
    if (!catalogItem || !catalogItem.isAvailable) {
      return { error: 'itemsUnavailable' }
    }
    const quantity = Math.min(Math.max(Math.trunc(item.quantity), 1), 99)
    safeItems.push({
      id: catalogItem.id,
      name: catalogItem.name,
      price: catalogItem.price,
      quantity,
    })
  }

  const totalAmount = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const [order] = await db
    .insert(roomServiceOrders)
    .values({
      reservationCode: reservation.reservationCode,
      roomNumber: reservation.roomNumber,
      guestSurname: reservation.surname,
      items: JSON.stringify(safeItems),
      totalAmount,
      note,
      status: 'pending',
    })
    .returning({ id: roomServiceOrders.id })

  revalidatePath('/dashboard/orders/room-service-orders')
  return { orderId: order.id }
}

export type RoomServiceOrder = {
  id: number
  reservationCode: string
  roomNumber: string
  guestSurname: string
  items: string
  totalAmount: number
  note: string
  status: string
  cancellationReason: string
  cancelledBy: string
  createdAt: Date
}

// Newest-first window — the admin screen starts with the most recent orders
// and loads older ones on demand so the query doesn't grow with order history.
export async function getRoomServiceOrders(limit = 100): Promise<RoomServiceOrder[]> {
  await requireAdmin('/dashboard/orders/room-service-orders')
  return db
    .select()
    .from(roomServiceOrders)
    .orderBy(desc(roomServiceOrders.createdAt))
    .limit(limit)
}

export async function countRoomServiceOrders(): Promise<number> {
  await requireAdmin('/dashboard/orders/room-service-orders')
  return db.$count(roomServiceOrders)
}

export type OrderStatus = 'confirmed' | 'delivered' | 'cancelled'

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  cancellationReason?: string,
  cancelledBy: 'guest' | 'staff' = 'staff'
): Promise<void> {
  await requireAdmin('/dashboard/orders/room-service-orders')
  const [order] = await db
    .update(roomServiceOrders)
    .set({
      status,
      ...(status === 'cancelled'
        ? { cancellationReason: cancellationReason ?? '', cancelledBy }
        : {}),
    })
    .where(eq(roomServiceOrders.id, orderId))
    .returning()

  // Push after the response is sent — staff shouldn't wait on push-service HTTP.
  if (order) {
    const push = {
      confirmed: {
        title: 'Order confirmed',
        body: `Your room service order #${order.id} is being prepared.`,
      },
      delivered: {
        title: 'Order delivered',
        body: `Your room service order #${order.id} has been delivered. Enjoy!`,
      },
      cancelled: {
        title: 'Order cancelled',
        body: cancellationReason
          ? `Your room service order #${order.id} was cancelled: ${cancellationReason}`
          : `Your room service order #${order.id} was cancelled.`,
      },
    }[status]
    after(() =>
      sendPushToReservation(order.reservationCode, { ...push, url: '/portal/room-service' })
    )
  }

  revalidatePath('/dashboard/orders/room-service-orders')
}

export async function cancelGuestOrder(
  orderId: number,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) return { error: 'notAuthenticated' }

  const guest = await verifyGuestToken(token)
  if (!guest) return { error: 'sessionExpired' }

  const [order] = await db
    .select()
    .from(roomServiceOrders)
    .where(eq(roomServiceOrders.id, orderId))

  if (!order) return { error: 'orderNotFound' }
  if (order.reservationCode !== guest.reservationCode) return { error: 'unauthorized' }
  if (order.status !== 'pending') return { error: 'orderNotCancellable' }

  await db
    .update(roomServiceOrders)
    .set({
      status: 'cancelled',
      cancellationReason: reason ?? '',
      cancelledBy: 'guest',
    })
    .where(eq(roomServiceOrders.id, orderId))

  revalidatePath('/portal/room-service')
  revalidatePath('/dashboard/orders/room-service-orders')
  return { success: true }
}

export async function getGuestRoomServiceOrders(): Promise<RoomServiceOrder[]> {
  // Reservation code comes from the verified session, never from the caller —
  // otherwise any guest could read another room's orders.
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const guest = token ? await verifyGuestToken(token) : null
  if (!guest) return []

  return db
    .select()
    .from(roomServiceOrders)
    .where(eq(roomServiceOrders.reservationCode, guest.reservationCode))
    .orderBy(desc(roomServiceOrders.createdAt))
}
