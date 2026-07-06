'use server'

import { db } from '@/lib/db'
import { spaServices } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

export type SpaServiceInput = {
  id: string
  name: string
  description: string
  image: string
  imageAlt: string
  openTime: string | null
  closeTime: string | null
  isFree: boolean
  price: string
  requiresReservation: boolean
  tags: string
  orderIndex: number
}

export async function getSpaServices() {
  return db.select().from(spaServices).orderBy(asc(spaServices.orderIndex))
}

export async function createSpaService(data: SpaServiceInput) {
  await requireAdmin('/dashboard/content/spa')
  await db.insert(spaServices).values(data)
  revalidatePath('/spa')
}

export async function updateSpaService(id: string, data: Omit<SpaServiceInput, 'id'>) {
  await requireAdmin('/dashboard/content/spa')
  await db.update(spaServices).set(data).where(eq(spaServices.id, id))
  revalidatePath('/spa')
}

export async function deleteSpaService(id: string) {
  await requireAdmin('/dashboard/content/spa')
  await db.delete(spaServices).where(eq(spaServices.id, id))
  revalidatePath('/spa')
}
