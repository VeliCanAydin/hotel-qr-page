'use server'

import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

import { db } from '@/lib/db'
import { nearbyGuideItems as nearbyGuideItemsTable } from '@/lib/db/schema'
import { nearbyGuideItems as seedNearbyGuideItems } from '@/lib/data/nearby-guide'
import type { NearbyGuideIconKey, NearbyGuideItem, NearbyGuideSection } from '@/lib/types/nearby-guide'

function normalizePhone(phone: string | null | undefined) {
  const trimmed = phone?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeItem(data: NearbyGuideItem) {
  return {
    ...data,
    name: data.name.trim(),
    distance: data.distance.trim(),
    eta: data.eta.trim(),
    note: data.note.trim(),
    phone: normalizePhone(data.phone),
    mapQuery: data.mapQuery.trim(),
    tone: data.tone.trim(),
    section: data.section,
    iconKey: data.iconKey,
    orderIndex: data.orderIndex,
  }
}

export async function getNearbyGuideItems(): Promise<NearbyGuideItem[]> {
  const rows = await db
    .select()
    .from(nearbyGuideItemsTable)
    .orderBy(asc(nearbyGuideItemsTable.section), asc(nearbyGuideItemsTable.orderIndex), asc(nearbyGuideItemsTable.name))

  if (rows.length === 0) {
    return seedNearbyGuideItems
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    distance: row.distance,
    eta: row.eta,
    note: row.note,
    phone: row.phone ?? null,
    mapQuery: row.mapQuery,
    tone: row.tone,
    section: row.section as NearbyGuideSection,
    iconKey: row.iconKey as NearbyGuideIconKey,
    orderIndex: row.orderIndex,
  }))
}

export async function createNearbyGuideItem(data: NearbyGuideItem) {
  await requireAdmin('/dashboard/content/nearby-guide')
  await db.insert(nearbyGuideItemsTable).values(normalizeItem(data))
  revalidatePath('/nearby-guide')
  revalidatePath('/dashboard/content/nearby-guide')
}

export async function updateNearbyGuideItem(id: string, data: Omit<NearbyGuideItem, 'id'>) {
  await requireAdmin('/dashboard/content/nearby-guide')
  await db
    .update(nearbyGuideItemsTable)
    .set(normalizeItem({ id, ...data }))
    .where(eq(nearbyGuideItemsTable.id, id))
  revalidatePath('/nearby-guide')
  revalidatePath('/dashboard/content/nearby-guide')
}

export async function deleteNearbyGuideItem(id: string) {
  await requireAdmin('/dashboard/content/nearby-guide')
  await db.delete(nearbyGuideItemsTable).where(eq(nearbyGuideItemsTable.id, id))
  revalidatePath('/nearby-guide')
  revalidatePath('/dashboard/content/nearby-guide')
}