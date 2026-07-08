'use server'

import { db } from '@/lib/db'
import { kidsServices, kidsServiceItems, kidsActivities } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsFor, deleteTranslationsForMany } from '@/lib/translations'

export type KidsServiceInput = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
  orderIndex: number
}

function revalidate() {
  updateTag(CONTENT_TAGS.kidsCare)
}

export async function createKidsService(data: KidsServiceInput) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.insert(kidsServices).values(data)
  revalidate()
}

export async function updateKidsService(id: string, data: Omit<KidsServiceInput, 'id'>) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.update(kidsServices).set(data).where(eq(kidsServices.id, id))
  revalidate()
}

export async function deleteKidsService(id: string) {
  await requireAdmin('/dashboard/content/kids-care')
  // kids_service_items + kids_activities cascade-delete via FK; their translations
  // are polymorphic (no FK), so clear them here before the rows disappear.
  const [itemRows, activityRows] = await Promise.all([
    db.select({ id: kidsServiceItems.id }).from(kidsServiceItems).where(eq(kidsServiceItems.serviceId, id)),
    db.select({ id: kidsActivities.id }).from(kidsActivities).where(eq(kidsActivities.serviceId, id)),
  ])
  await deleteTranslationsForMany('kids_service_item', itemRows.map((r) => r.id))
  await deleteTranslationsForMany('kids_activity', activityRows.map((r) => String(r.id)))
  await deleteTranslationsFor('kids_service', id)
  await db.delete(kidsServices).where(eq(kidsServices.id, id))
  revalidate()
}

export async function createKidsServiceItem(serviceId: string, trigger: string, content: string, orderIndex: number) {
  await requireAdmin('/dashboard/content/kids-care')
  const id = crypto.randomUUID()
  await db.insert(kidsServiceItems).values({ id, serviceId, trigger, content, orderIndex })
  revalidate()
  return id
}

export async function updateKidsServiceItem(id: string, trigger: string, content: string) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.update(kidsServiceItems).set({ trigger, content }).where(eq(kidsServiceItems.id, id))
  revalidate()
}

export async function deleteKidsServiceItem(id: string) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.delete(kidsServiceItems).where(eq(kidsServiceItems.id, id))
  await deleteTranslationsFor('kids_service_item', id)
  revalidate()
}

export async function getKidsServices() {
  return db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex))
}

export async function getKidsServiceItems() {
  return db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.orderIndex))
}
