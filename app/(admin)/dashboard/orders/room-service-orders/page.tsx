import { getRoomServiceOrders } from '@/lib/actions/room-service-orders'
import RoomServiceOrdersClient from './room-service-orders-client'

export default async function RoomServiceOrdersPage() {
  const orders = await getRoomServiceOrders()
  return <RoomServiceOrdersClient initialOrders={orders} />
}
