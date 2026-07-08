'use server'

import { db } from '@/lib/db'
import { restaurants, menuTemplates, menuTemplateItems } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { MENU_TEMPLATE_ITEM_ENTITY } from '@/lib/i18n-entities'
import { deleteTranslationsFor, deleteTranslationsForMany } from '@/lib/translations'

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
  await requireAdmin('/dashboard/services/restaurant')
  await db.insert(restaurants).values({ ...data, orderIndex: data.orderIndex ?? 99 })
  updateTag(CONTENT_TAGS.restaurants)
}

export async function updateRestaurant(id: string, data: Omit<RestaurantInput, 'id'>) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.update(restaurants).set(data).where(eq(restaurants.id, id))
  updateTag(CONTENT_TAGS.restaurants)
}

export async function deleteRestaurant(id: string) {
  await requireAdmin('/dashboard/services/restaurant')
  if (PROTECTED_IDS.includes(id)) throw new Error('Cannot delete a built-in restaurant')
  // menu_templates cascade-delete via FK, taking their menu_template_items with
  // them; clear those template-item translations first (polymorphic, no FK).
  const templateRows = await db
    .select({ id: menuTemplates.id })
    .from(menuTemplates)
    .where(eq(menuTemplates.restaurantId, id))
  if (templateRows.length > 0) {
    const templateItemRows = await db
      .select({ id: menuTemplateItems.id })
      .from(menuTemplateItems)
      .where(inArray(menuTemplateItems.templateId, templateRows.map((t) => t.id)))
    await deleteTranslationsForMany(MENU_TEMPLATE_ITEM_ENTITY, templateItemRows.map((r) => r.id))
  }
  await deleteTranslationsFor('restaurant', id)
  await db.delete(restaurants).where(eq(restaurants.id, id))
  updateTag(CONTENT_TAGS.restaurants)
}
