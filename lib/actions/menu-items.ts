'use server'

import { db } from '@/lib/db'
import { menuItems } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

type MenuItemInput = {
  id: string
  name: string
  description: string
  price: number
  image: string
  isVegetarian?: boolean
  category: string
}

export async function createMenuItem(item: MenuItemInput) {
  await db.insert(menuItems).values({ ...item, isVegetarian: item.isVegetarian ?? false })
  revalidatePath('/restaurants/a-la-carte')
}

export async function updateMenuItem(id: string, data: Omit<MenuItemInput, 'id'>) {
  await db.update(menuItems).set({ ...data, isVegetarian: data.isVegetarian ?? false }).where(eq(menuItems.id, id))
  revalidatePath('/restaurants/a-la-carte')
}

export async function deleteMenuItem(id: string) {
  await db.delete(menuItems).where(eq(menuItems.id, id))
  revalidatePath('/restaurants/a-la-carte')
}
