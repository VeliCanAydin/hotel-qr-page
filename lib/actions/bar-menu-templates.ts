'use server'

import { db } from '@/lib/db'
import { barMenuTemplates, barMenuTemplateItems, barMenuItems } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsForMany } from '@/lib/translations'

export type BarTemplateItemInput = {
  name: string
  description: string
  priceText: string
  category: string
  orderIndex?: number
}

// ── Template list ──────────────────────────────────────────────────────────────

export async function getBarMenuTemplates(barId: string) {
  await requireAdmin('/dashboard/services/bars')
  const templates = await db
    .select()
    .from(barMenuTemplates)
    .where(eq(barMenuTemplates.barId, barId))
    .orderBy(asc(barMenuTemplates.createdAt))

  const counts = await Promise.all(
    templates.map(async (t) => {
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(barMenuTemplateItems)
        .where(eq(barMenuTemplateItems.templateId, t.id))
      return { id: t.id, count: rows[0]?.count ?? 0 }
    })
  )
  const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]))
  return templates.map((t) => ({ ...t, itemCount: countMap[t.id] ?? 0 }))
}

export async function createBarMenuTemplate(barId: string, name: string) {
  await requireAdmin('/dashboard/services/bars')
  const id = crypto.randomUUID()
  await db.insert(barMenuTemplates).values({ id, name, barId })
  revalidatePath('/dashboard/services/bars')
  return id
}

/** Snapshot the bar's current live menu items into a new template. */
export async function saveCurrentBarMenuAsTemplate(barId: string, name: string) {
  await requireAdmin('/dashboard/services/bars')
  const templateId = crypto.randomUUID()
  await db.insert(barMenuTemplates).values({ id: templateId, name, barId })

  const currentItems = await db
    .select()
    .from(barMenuItems)
    .where(eq(barMenuItems.barId, barId))
    .orderBy(asc(barMenuItems.orderIndex))

  if (currentItems.length > 0) {
    await db.insert(barMenuTemplateItems).values(
      currentItems.map((item, index) => ({
        id: crypto.randomUUID(),
        templateId,
        name: item.name,
        description: item.description,
        priceText: item.priceText,
        category: item.category,
        orderIndex: index,
      }))
    )
  }

  revalidatePath('/dashboard/services/bars')
  return templateId
}

/** Replace all live bar menu items with a template's items. */
export async function loadBarMenuTemplate(templateId: string, barId: string) {
  await requireAdmin('/dashboard/services/bars')

  const templateItemRows = await db
    .select()
    .from(barMenuTemplateItems)
    .where(eq(barMenuTemplateItems.templateId, templateId))
    .orderBy(asc(barMenuTemplateItems.orderIndex))

  // Delete existing live items (translations are polymorphic — clear them first)
  const existing = await db
    .select({ id: barMenuItems.id })
    .from(barMenuItems)
    .where(eq(barMenuItems.barId, barId))

  if (existing.length > 0) {
    await deleteTranslationsForMany('bar_menu_item', existing.map((e) => e.id))
    await db.delete(barMenuItems).where(eq(barMenuItems.barId, barId))
  }

  if (templateItemRows.length > 0) {
    await db.insert(barMenuItems).values(
      templateItemRows.map((ti, index) => ({
        id: crypto.randomUUID(),
        barId,
        name: ti.name,
        description: ti.description,
        priceText: ti.priceText,
        category: ti.category,
        orderIndex: index,
      }))
    )
  }

  revalidatePath('/dashboard/services/bars')
  updateTag(CONTENT_TAGS.bars)
}

export async function deleteBarMenuTemplate(id: string) {
  await requireAdmin('/dashboard/services/bars')
  // bar_menu_template_items cascade-delete via FK
  await db.delete(barMenuTemplates).where(eq(barMenuTemplates.id, id))
  revalidatePath('/dashboard/services/bars')
}

// ── Template items ─────────────────────────────────────────────────────────────

export async function getBarTemplateItems(templateId: string) {
  await requireAdmin('/dashboard/services/bars')
  return db
    .select()
    .from(barMenuTemplateItems)
    .where(eq(barMenuTemplateItems.templateId, templateId))
    .orderBy(asc(barMenuTemplateItems.orderIndex))
}

export async function addBarTemplateItem(templateId: string, item: BarTemplateItemInput) {
  await requireAdmin('/dashboard/services/bars')
  const id = crypto.randomUUID()
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(barMenuTemplateItems)
    .where(eq(barMenuTemplateItems.templateId, templateId))
  const orderIndex = item.orderIndex ?? (countRows[0]?.count ?? 0)

  await db.insert(barMenuTemplateItems).values({
    id,
    templateId,
    name: item.name,
    description: item.description,
    priceText: item.priceText,
    category: item.category,
    orderIndex,
  })
  revalidatePath('/dashboard/services/bars')
  return id
}

export async function updateBarTemplateItem(id: string, data: Partial<BarTemplateItemInput>) {
  await requireAdmin('/dashboard/services/bars')
  await db.update(barMenuTemplateItems).set(data).where(eq(barMenuTemplateItems.id, id))
  revalidatePath('/dashboard/services/bars')
}

export async function removeBarTemplateItem(id: string) {
  await requireAdmin('/dashboard/services/bars')
  await db.delete(barMenuTemplateItems).where(eq(barMenuTemplateItems.id, id))
  revalidatePath('/dashboard/services/bars')
}
