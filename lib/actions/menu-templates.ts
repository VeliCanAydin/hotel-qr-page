'use server'

import { db } from '@/lib/db'
import { menuTemplates, menuTemplateItems, menuItems, menuItemImages } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'

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
    await db.insert(menuTemplateItems).values(
      currentItems.map((item, index) => ({
        id: crypto.randomUUID(),
        templateId,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        isVegetarian: item.isVegetarian,
        imageUrl: imageMap[item.id] ?? null,
        allergens: JSON.stringify(Array.isArray(item.allergens) ? item.allergens : []),
        orderIndex: index,
      }))
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
      allergens: JSON.stringify(Array.isArray(ti.allergens) ? ti.allergens : []),
      restaurantId,
    }))
    await db.insert(menuItems).values(newItems)

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
  revalidatePath('/dashboard/services/restaurant')
}
