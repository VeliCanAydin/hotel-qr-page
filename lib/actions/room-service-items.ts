'use server'

import { db } from '@/lib/db'
import { roomServiceItems, roomServiceCategories } from '@/lib/db/schema'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsFor } from '@/lib/translations'
import { eq, sql } from 'drizzle-orm'

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
  await deleteTranslationsFor('room_service_item', id)
  updateTag(CONTENT_TAGS.roomServiceItems)
}

/** Kitchen's "sold out" switch — the item vanishes from the guest menu and
 *  new orders containing it are rejected until it's switched back on. */
export async function setRoomServiceItemAvailability(id: string, isAvailable: boolean) {
  await requireAdmin('/dashboard/services/room-service')
  await db.update(roomServiceItems).set({ isAvailable }).where(eq(roomServiceItems.id, id))
  updateTag(CONTENT_TAGS.roomServiceItems)
}

export async function createRoomServiceCategory(id: string, label: string) {
  await requireAdmin('/dashboard/services/room-service')
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(roomServiceCategories)
  await db.insert(roomServiceCategories).values({ id, label, orderIndex: Number(count) }).onConflictDoNothing()
  updateTag(CONTENT_TAGS.roomServiceItems)
}
