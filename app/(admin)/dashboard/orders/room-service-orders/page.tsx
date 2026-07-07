import { countRoomServiceOrders, getRoomServiceOrders } from '@/lib/actions/room-service-orders'
import RoomServiceOrdersClient from './room-service-orders-client'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

export default async function RoomServiceOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>
}) {
  const { limit: limitParam } = await searchParams
  const limit = Math.min(Math.max(Number(limitParam) || DEFAULT_LIMIT, DEFAULT_LIMIT), MAX_LIMIT)

  const [orders, totalCount] = await Promise.all([
    getRoomServiceOrders(limit),
    countRoomServiceOrders(),
  ])
  return <RoomServiceOrdersClient initialOrders={orders} totalCount={totalCount} limit={limit} />
}
