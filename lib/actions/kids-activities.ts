'use server'

import { db } from '@/lib/db'
import { kidsActivities } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'

function revalidate() {
  revalidatePath('/kids-care')
  revalidatePath('/dashboard/content/kids-care')
}

export async function createKidsActivity(
  serviceId: string, day: string, time: string, event: string, orderIndex: number
): Promise<number> {
  await requireAdmin('/dashboard/content/kids-care')
  const rows = await db
    .insert(kidsActivities)
    .values({ serviceId, day, time, event, orderIndex })
    .returning({ id: kidsActivities.id })
  revalidate()
  return rows[0].id
}

export async function updateKidsActivity(id: number, time: string, event: string) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.update(kidsActivities).set({ time, event }).where(eq(kidsActivities.id, id))
  revalidate()
}

export async function deleteKidsActivity(id: number) {
  await requireAdmin('/dashboard/content/kids-care')
  await db.delete(kidsActivities).where(eq(kidsActivities.id, id))
  revalidate()
}
