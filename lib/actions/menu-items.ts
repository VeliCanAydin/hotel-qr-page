'use server'

import { db } from '@/lib/db'
import { menuItems, menuCategories, menuItemImages } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

type MenuItemInput = {
  id: string
  name: string
  description: string
  price: number
  isVegetarian?: boolean
  category: string
  restaurantId: string
  allergens?: string[]
}

export async function createMenuItem(item: MenuItemInput) {
  await db.insert(menuItems).values({
    ...item,
    isVegetarian: item.isVegetarian ?? false,
    allergens: JSON.stringify(item.allergens ?? []),
  })
  revalidatePath(`/restaurants/${item.restaurantId}`)
  revalidatePath('/dashboard/services/restaurant')
}

export async function updateMenuItem(id: string, data: Omit<MenuItemInput, 'id'>) {
  await db.update(menuItems).set({
    ...data,
    isVegetarian: data.isVegetarian ?? false,
    allergens: JSON.stringify(data.allergens ?? []),
  }).where(eq(menuItems.id, id))
  revalidatePath(`/restaurants/${data.restaurantId}`)
  revalidatePath('/dashboard/services/restaurant')
}

export async function deleteMenuItem(id: string) {
  await db.delete(menuItems).where(eq(menuItems.id, id))
  await db.delete(menuItemImages).where(eq(menuItemImages.itemId, id))
  revalidatePath('/restaurants/a-la-carte')
}

export async function deleteMenuItemImage(itemId: string) {
  await db.delete(menuItemImages).where(eq(menuItemImages.itemId, itemId))
  revalidatePath('/restaurants/a-la-carte')
}

export async function upsertMenuItemImage(itemId: string, proxyUrl: string) {
  await db
    .insert(menuItemImages)
    .values({ itemId, proxyUrl })
    .onConflictDoUpdate({ target: menuItemImages.itemId, set: { proxyUrl } })
  revalidatePath('/restaurants/a-la-carte')
}

export async function getMenuCategories() {
  return db.select().from(menuCategories).orderBy(menuCategories.orderIndex)
}

export async function createMenuCategory(id: string, label: string) {
  await db.insert(menuCategories).values({ id, label }).onConflictDoNothing()
  revalidatePath('/dashboard/services/restaurant')
}
