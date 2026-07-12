'use server'

import { db } from '@/lib/db'
import { bars, barMenuItems, barMenuCategories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsFor, deleteTranslationsForMany } from '@/lib/translations'

export type BarInput = {
  id: string
  name: string
  description: string
  highlights: string
  image: string
  openTime: string | null
  closeTime: string | null
  orderIndex?: number
}

export type BarMenuItemInput = {
  name: string
  description: string
  priceText: string
  category: string
  orderIndex?: number
}

export async function getBars() {
  return db.select().from(bars).orderBy(asc(bars.orderIndex))
}

export async function createBar(data: BarInput) {
  await requireAdmin('/dashboard/services/bars')
  await db.insert(bars).values({ ...data, orderIndex: data.orderIndex ?? 99 })
  updateTag(CONTENT_TAGS.bars)
}

export async function updateBar(id: string, data: Omit<BarInput, 'id'>) {
  await requireAdmin('/dashboard/services/bars')
  await db.update(bars).set(data).where(eq(bars.id, id))
  updateTag(CONTENT_TAGS.bars)
}

export async function deleteBar(id: string) {
  await requireAdmin('/dashboard/services/bars')
  // bar_menu_items cascade-delete via FK; their translations are polymorphic
  // (no FK), so clear them first.
  const itemRows = await db
    .select({ id: barMenuItems.id })
    .from(barMenuItems)
    .where(eq(barMenuItems.barId, id))
  await deleteTranslationsForMany('bar_menu_item', itemRows.map((r) => r.id))
  await deleteTranslationsFor('bar', id)
  await db.delete(bars).where(eq(bars.id, id))
  updateTag(CONTENT_TAGS.bars)
}

export async function createBarMenuItem(barId: string, data: BarMenuItemInput) {
  await requireAdmin('/dashboard/services/bars')
  const id = crypto.randomUUID()
  await db.insert(barMenuItems).values({ ...data, id, barId, orderIndex: data.orderIndex ?? 999 })
  updateTag(CONTENT_TAGS.bars)
  return id
}

export async function updateBarMenuItem(id: string, data: BarMenuItemInput) {
  await requireAdmin('/dashboard/services/bars')
  await db.update(barMenuItems).set(data).where(eq(barMenuItems.id, id))
  updateTag(CONTENT_TAGS.bars)
}

export async function deleteBarMenuItem(id: string) {
  await requireAdmin('/dashboard/services/bars')
  await db.delete(barMenuItems).where(eq(barMenuItems.id, id))
  await deleteTranslationsFor('bar_menu_item', id)
  updateTag(CONTENT_TAGS.bars)
}

export async function createBarMenuCategory(id: string, label: string) {
  await requireAdmin('/dashboard/services/bars')
  await db.insert(barMenuCategories).values({ id, label }).onConflictDoNothing()
  updateTag(CONTENT_TAGS.bars)
}
