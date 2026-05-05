'use server'

import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const PROTECTED_IDS = ['a-la-carte', 'main-restaurant', 'snack-restaurant']

export type RestaurantInput = {
  id: string
  name: string
  cuisine: string
  openTime: string | null
  closeTime: string | null
  description: string
  reservation: boolean
  orderIndex?: number
}

export async function getRestaurants() {
  return db.select().from(restaurants).orderBy(asc(restaurants.orderIndex))
}

export async function createRestaurant(data: RestaurantInput) {
  await db.insert(restaurants).values({ ...data, orderIndex: data.orderIndex ?? 99 })
  revalidatePath('/dashboard/services/restaurant')
}

export async function updateRestaurant(id: string, data: Omit<RestaurantInput, 'id'>) {
  await db.update(restaurants).set(data).where(eq(restaurants.id, id))
  revalidatePath('/dashboard/services/restaurant')
}

export async function deleteRestaurant(id: string) {
  if (PROTECTED_IDS.includes(id)) throw new Error('Cannot delete a built-in restaurant')
  await db.delete(restaurants).where(eq(restaurants.id, id))
  revalidatePath('/dashboard/services/restaurant')
}
