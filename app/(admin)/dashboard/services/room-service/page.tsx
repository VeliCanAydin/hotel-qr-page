
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { roomServiceItems, roomServiceCategories } from '@/lib/db/schema'
import { type RoomServiceItem, type RoomServiceCategory } from '@/lib/types/room-service'
import RoomServiceClient from './room-service-client'

export default async function RoomServicePage() {
  const [items, categories] = await Promise.all([
    db.select().from(roomServiceItems),
    db.select().from(roomServiceCategories).orderBy(asc(roomServiceCategories.orderIndex)),
  ])
  return <RoomServiceClient initialItems={items as RoomServiceItem[]} initialCategories={categories as RoomServiceCategory[]} />
}
