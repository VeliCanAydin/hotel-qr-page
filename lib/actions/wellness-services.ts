'use server'

import { db } from '@/lib/db'
import { wellnessServices } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

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
  await db.insert(wellnessServices).values(data)
  revalidatePath('/wellness')
}

export async function updateWellnessService(id: string, data: Omit<WellnessServiceInput, 'id'>) {
  await db.update(wellnessServices).set(data).where(eq(wellnessServices.id, id))
  revalidatePath('/wellness')
}

export async function deleteWellnessService(id: string) {
  await db.delete(wellnessServices).where(eq(wellnessServices.id, id))
  revalidatePath('/wellness')
}
