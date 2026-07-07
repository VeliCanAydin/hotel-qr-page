'use server'

import { db } from '@/lib/db'
import { menuItems, menuCategories, menuItemImages } from '@/lib/db/schema'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'

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
  await requireAdmin('/dashboard/services/restaurant')
  await db.insert(menuItems).values({
    ...item,
    isVegetarian: item.isVegetarian ?? false,
    allergens: JSON.stringify(item.allergens ?? []),
  })
  updateTag(CONTENT_TAGS.menuItems)
}

export async function updateMenuItem(id: string, data: Omit<MenuItemInput, 'id'>) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.update(menuItems).set({
    ...data,
    isVegetarian: data.isVegetarian ?? false,
    allergens: JSON.stringify(data.allergens ?? []),
  }).where(eq(menuItems.id, id))
  updateTag(CONTENT_TAGS.menuItems)
}

export async function deleteMenuItem(id: string) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.delete(menuItems).where(eq(menuItems.id, id))
  await db.delete(menuItemImages).where(eq(menuItemImages.itemId, id))
  updateTag(CONTENT_TAGS.menuItems)
}

export async function deleteMenuItemImage(itemId: string) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.delete(menuItemImages).where(eq(menuItemImages.itemId, itemId))
  updateTag(CONTENT_TAGS.menuItems)
}

export async function upsertMenuItemImage(itemId: string, proxyUrl: string) {
  await requireAdmin('/dashboard/services/restaurant')
  await db
    .insert(menuItemImages)
    .values({ itemId, proxyUrl })
    .onConflictDoUpdate({ target: menuItemImages.itemId, set: { proxyUrl } })
  updateTag(CONTENT_TAGS.menuItems)
}

export async function getMenuCategories() {
  return db.select().from(menuCategories).orderBy(menuCategories.orderIndex)
}

export async function createMenuCategory(id: string, label: string) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.insert(menuCategories).values({ id, label }).onConflictDoNothing()
  updateTag(CONTENT_TAGS.menuItems)
}
