'use server'

import { db } from '@/lib/db'
import { roomServiceOrders, roomServiceItems } from '@/lib/db/schema'
import { verifyGuestToken, requireAdmin, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { cookies } from 'next/headers'
import { desc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

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
    return { error: 'Not authenticated', redirectTo: '/login?redirect=/room-service/cart' }
  }

  const guest = await verifyGuestToken(token)
  if (!guest) {
    return { error: 'Session expired', redirectTo: '/login?redirect=/room-service/cart' }
  }

  if (!items.length) {
    return { error: 'Your cart is empty.' }
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
    if (!catalogItem) {
      return { error: 'Some items in your cart are no longer available. Please refresh and try again.' }
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
      reservationCode: guest.reservationCode,
      roomNumber: guest.roomNumber,
      guestSurname: guest.surname,
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

export async function getRoomServiceOrders(): Promise<RoomServiceOrder[]> {
  await requireAdmin('/dashboard/orders/room-service-orders')
  return db
    .select()
    .from(roomServiceOrders)
    .orderBy(desc(roomServiceOrders.createdAt))
}

export type OrderStatus = 'confirmed' | 'delivered' | 'cancelled'

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  cancellationReason?: string,
  cancelledBy: 'guest' | 'staff' = 'staff'
): Promise<void> {
  await requireAdmin('/dashboard/orders/room-service-orders')
  await db
    .update(roomServiceOrders)
    .set({
      status,
      ...(status === 'cancelled'
        ? { cancellationReason: cancellationReason ?? '', cancelledBy }
        : {}),
    })
    .where(eq(roomServiceOrders.id, orderId))

  revalidatePath('/dashboard/orders/room-service-orders')
}

export async function cancelGuestOrder(
  orderId: number,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (!token) return { error: 'Not authenticated' }

  const guest = await verifyGuestToken(token)
  if (!guest) return { error: 'Session expired' }

  const [order] = await db
    .select()
    .from(roomServiceOrders)
    .where(eq(roomServiceOrders.id, orderId))

  if (!order) return { error: 'Order not found' }
  if (order.reservationCode !== guest.reservationCode) return { error: 'Unauthorized' }
  if (order.status !== 'pending') return { error: 'Only pending orders can be cancelled' }

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
