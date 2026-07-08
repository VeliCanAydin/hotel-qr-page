'use server'

import { db } from '@/lib/db'
import { wellnessServices } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { deleteTranslationsFor } from '@/lib/translations'

export type WellnessServiceInput = {
  id: string
  name: string
  description: string
  image: string
  imageAlt: string
  openTime: string | null
  closeTime: string | null
  isPaid: boolean
  requiresReservation: boolean
  orderIndex: number
}

export async function getWellnessServices() {
  return db.select().from(wellnessServices).orderBy(asc(wellnessServices.orderIndex))
}

export async function createWellnessService(data: WellnessServiceInput) {
  await requireAdmin('/dashboard/content/wellness')
  await db.insert(wellnessServices).values(data)
  updateTag(CONTENT_TAGS.wellnessServices)
}

export async function updateWellnessService(id: string, data: Omit<WellnessServiceInput, 'id'>) {
  await requireAdmin('/dashboard/content/wellness')
  await db.update(wellnessServices).set(data).where(eq(wellnessServices.id, id))
  updateTag(CONTENT_TAGS.wellnessServices)
}

export async function deleteWellnessService(id: string) {
  await requireAdmin('/dashboard/content/wellness')
  await db.delete(wellnessServices).where(eq(wellnessServices.id, id))
  await deleteTranslationsFor('wellness_service', id)
  updateTag(CONTENT_TAGS.wellnessServices)
}
