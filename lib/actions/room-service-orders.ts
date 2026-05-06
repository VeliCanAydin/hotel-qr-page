'use server'

import { db } from '@/lib/db'
import { roomServiceOrders } from '@/lib/db/schema'
import { verifyGuestToken, GUEST_SESSION_COOKIE } from '@/lib/auth'
import { cookies } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type CreateOrderResult =
  | { orderId: number }
  | { error: string; redirectTo: string }

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

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const [order] = await db
    .insert(roomServiceOrders)
    .values({
      reservationCode: guest.reservationCode,
      roomNumber: guest.roomNumber,
      guestSurname: guest.surname,
      items: JSON.stringify(items),
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

export async function getGuestRoomServiceOrders(
  reservationCode: string
): Promise<RoomServiceOrder[]> {
  return db
    .select()
    .from(roomServiceOrders)
    .where(eq(roomServiceOrders.reservationCode, reservationCode))
    .orderBy(desc(roomServiceOrders.createdAt))
}
