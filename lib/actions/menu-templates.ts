'use server'

import { db } from '@/lib/db'
import { menuTemplates, menuTemplateItems, menuItems, menuItemImages } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { MENU_TEMPLATE_ITEM_ENTITY } from '@/lib/i18n-entities'
import { copyTranslationsBatch, deleteTranslationsFor, deleteTranslationsForMany } from '@/lib/translations'

export type TemplateItemInput = {
  name: string
  description: string
  category: string
  price: number
  isVegetarian?: boolean
  imageUrl?: string | null
  orderIndex?: number
  allergens?: string[]
}

export async function getMenuTemplates(restaurantId: string) {
  await requireAdmin('/dashboard/services/restaurant')
  const templates = await db
    .select()
    .from(menuTemplates)
    .where(eq(menuTemplates.restaurantId, restaurantId))
    .orderBy(asc(menuTemplates.createdAt))

  const counts = await Promise.all(
    templates.map(async (t) => {
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(menuTemplateItems)
        .where(eq(menuTemplateItems.templateId, t.id))
      return { id: t.id, count: rows[0]?.count ?? 0 }
    })
  )
  const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]))
  return templates.map((t) => ({ ...t, itemCount: countMap[t.id] ?? 0 }))
}

export async function createMenuTemplate(restaurantId: string, name: string) {
  await requireAdmin('/dashboard/services/restaurant')
  const id = crypto.randomUUID()
  await db.insert(menuTemplates).values({ id, name, restaurantId })
  revalidatePath('/dashboard/services/restaurant')
  return id
}

export async function saveCurrentMenuAsTemplate(restaurantId: string, name: string) {
  await requireAdmin('/dashboard/services/restaurant')
  const templateId = crypto.randomUUID()
  await db.insert(menuTemplates).values({ id: templateId, name, restaurantId })

  const currentItems = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))

  const imageRows = await db.select().from(menuItemImages)
  const imageMap = Object.fromEntries(imageRows.map((r) => [r.itemId, r.proxyUrl]))

  if (currentItems.length > 0) {
    const templateItemValues = currentItems.map((item, index) => ({
      id: crypto.randomUUID(),
      templateId,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isVegetarian: item.isVegetarian,
      imageUrl: imageMap[item.id] ?? null,
      allergens: typeof item.allergens === 'string' ? item.allergens : JSON.stringify(item.allergens ?? []),
      orderIndex: index,
    }))
    await db.insert(menuTemplateItems).values(templateItemValues)
    // Carry each menu item's translations onto its template item so they survive
    // a later loadMenuTemplate (which recreates menu_items with fresh ids).
    await copyTranslationsBatch(
      'menu_item',
      MENU_TEMPLATE_ITEM_ENTITY,
      currentItems.map((item, index) => ({ fromId: item.id, toId: templateItemValues[index].id })),
    )
  }

  revalidatePath('/dashboard/services/restaurant')
  return templateId
}

export async function loadMenuTemplate(templateId: string, restaurantId: string) {
  await requireAdmin('/dashboard/services/restaurant')
  const templateItemRows = await db
    .select()
    .from(menuTemplateItems)
    .where(eq(menuTemplateItems.templateId, templateId))
    .orderBy(asc(menuTemplateItems.orderIndex))

  const existing = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))

  if (existing.length > 0) {
    for (const { id } of existing) {
      await db.delete(menuItemImages).where(eq(menuItemImages.itemId, id))
    }
    // The old menu_items are about to vanish; drop their translations too.
    await deleteTranslationsForMany('menu_item', existing.map((e) => e.id))
    await db.delete(menuItems).where(eq(menuItems.restaurantId, restaurantId))
  }

  if (templateItemRows.length > 0) {
    const newItems = templateItemRows.map((ti) => ({
      id: crypto.randomUUID(),
      name: ti.name,
      description: ti.description,
      category: ti.category,
      price: ti.price,
      isVegetarian: ti.isVegetarian,
      allergens: typeof ti.allergens === 'string' ? ti.allergens : JSON.stringify(ti.allergens ?? []),
      restaurantId,
    }))
    await db.insert(menuItems).values(newItems)

    // Re-hydrate the fresh menu_items with the template's stored translations.
    await copyTranslationsBatch(
      MENU_TEMPLATE_ITEM_ENTITY,
      'menu_item',
      templateItemRows.map((ti, i) => ({ fromId: ti.id, toId: newItems[i].id })),
    )

    const imageInserts = templateItemRows
      .map((ti, i) => ({ itemId: newItems[i].id, proxyUrl: ti.imageUrl! }))
      .filter((r) => r.proxyUrl)
    if (imageInserts.length > 0) {
      await db.insert(menuItemImages).values(imageInserts)
    }
  }

  revalidatePath('/dashboard/services/restaurant')
  updateTag(CONTENT_TAGS.menuItems)
}

export async function deleteMenuTemplate(id: string) {
  await requireAdmin('/dashboard/services/restaurant')
  // menu_template_items cascade-delete via FK; clear their translations first.
  const itemRows = await db
    .select({ id: menuTemplateItems.id })
    .from(menuTemplateItems)
    .where(eq(menuTemplateItems.templateId, id))
  await deleteTranslationsForMany(MENU_TEMPLATE_ITEM_ENTITY, itemRows.map((r) => r.id))
  await db.delete(menuTemplates).where(eq(menuTemplates.id, id))
  revalidatePath('/dashboard/services/restaurant')
}

export async function getTemplateItems(templateId: string) {
  await requireAdmin('/dashboard/services/restaurant')
  return db
    .select()
    .from(menuTemplateItems)
    .where(eq(menuTemplateItems.templateId, templateId))
    .orderBy(asc(menuTemplateItems.orderIndex))
}

export async function addTemplateItem(templateId: string, item: TemplateItemInput) {
  await requireAdmin('/dashboard/services/restaurant')
  const id = crypto.randomUUID()
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(menuTemplateItems)
    .where(eq(menuTemplateItems.templateId, templateId))
  const orderIndex = item.orderIndex ?? (countRows[0]?.count ?? 0)

  await db.insert(menuTemplateItems).values({
    id,
    templateId,
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    isVegetarian: item.isVegetarian ?? false,
    imageUrl: item.imageUrl ?? null,
    allergens: JSON.stringify(item.allergens ?? []),
    orderIndex,
  })
  revalidatePath('/dashboard/services/restaurant')
  return id
}

export async function updateTemplateItem(id: string, data: Partial<TemplateItemInput>) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.update(menuTemplateItems).set({
    ...data,
    allergens: JSON.stringify(data.allergens ?? []),
  }).where(eq(menuTemplateItems.id, id))
  revalidatePath('/dashboard/services/restaurant')
}

export async function removeTemplateItem(id: string) {
  await requireAdmin('/dashboard/services/restaurant')
  await db.delete(menuTemplateItems).where(eq(menuTemplateItems.id, id))
  await deleteTranslationsFor(MENU_TEMPLATE_ITEM_ENTITY, id)
  revalidatePath('/dashboard/services/restaurant')
}
