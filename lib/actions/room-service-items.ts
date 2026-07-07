'use server'

import { db } from '@/lib/db'
import { roomServiceItems } from '@/lib/db/schema'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { eq } from 'drizzle-orm'

type RoomServiceItemInput = {
  id: string
  name: string
  description: string
  price: number
  category: string
  allergens?: string[]
}

export async function createRoomServiceItem(item: RoomServiceItemInput) {
  await requireAdmin('/dashboard/services/room-service')
  await db.insert(roomServiceItems).values(item)
  updateTag(CONTENT_TAGS.roomServiceItems)
}

export async function updateRoomServiceItem(id: string, data: Omit<RoomServiceItemInput, 'id'>) {
  await requireAdmin('/dashboard/services/room-service')
  await db.update(roomServiceItems).set(data).where(eq(roomServiceItems.id, id))
  updateTag(CONTENT_TAGS.roomServiceItems)
}

export async function deleteRoomServiceItem(id: string) {
  await requireAdmin('/dashboard/services/room-service')
  await db.delete(roomServiceItems).where(eq(roomServiceItems.id, id))
  updateTag(CONTENT_TAGS.roomServiceItems)
}
