'use server'

import { db } from '@/lib/db'
import { kidsActivities } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

export async function createKidsActivity(day: string, time: string, event: string, orderIndex: number) {
  await db.insert(kidsActivities).values({ day, time, event, orderIndex })
  revalidatePath('/kids-care')
}

export async function updateKidsActivity(day: string, oldTime: string, newTime: string, newEvent: string) {
  await db
    .update(kidsActivities)
    .set({ time: newTime, event: newEvent })
    .where(and(eq(kidsActivities.day, day), eq(kidsActivities.time, oldTime)))
  revalidatePath('/kids-care')
}

export async function deleteKidsActivity(day: string, time: string) {
  await db
    .delete(kidsActivities)
    .where(and(eq(kidsActivities.day, day), eq(kidsActivities.time, time)))
  revalidatePath('/kids-care')
}
