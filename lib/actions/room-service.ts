'use server'

import { db } from '@/lib/db'
import { roomServiceItems } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
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
  await db.insert(roomServiceItems).values(item)
  revalidatePath('/room-service')
}

export async function updateRoomServiceItem(id: string, data: Omit<RoomServiceItemInput, 'id'>) {
  await db.update(roomServiceItems).set(data).where(eq(roomServiceItems.id, id))
  revalidatePath('/room-service')
}

export async function deleteRoomServiceItem(id: string) {
  await db.delete(roomServiceItems).where(eq(roomServiceItems.id, id))
  revalidatePath('/room-service')
}
