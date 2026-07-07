export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { roomServiceItems } from '@/lib/db/schema'
import { type RoomServiceItem } from '@/lib/data/room-service-data'
import RoomServiceClient from './room-service-client'

export default async function RoomServicePage() {
  const items = await db.select().from(roomServiceItems)
  const typed: RoomServiceItem[] = items.map((item) => ({
    ...item,
    category: item.category as RoomServiceItem['category'],
  }))
  return <RoomServiceClient initialItems={typed} />
}
