'use server'

import { db } from '@/lib/db'
import { beachPoolsInfo } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type BeachPoolsInfoData = {
  beachDescription: string
  beachHours: string
  beachNotes: string
  mainPoolDescription: string
  mainPoolHours: string
  indoorPoolDescription: string
  indoorPoolHours: string
  kidsPoolDescription: string
  kidsPoolHours: string
  generalNotes: string
}

const DEFAULTS: BeachPoolsInfoData = {
  beachDescription: '',
  beachHours: '',
  beachNotes: '',
  mainPoolDescription: '',
  mainPoolHours: '',
  indoorPoolDescription: '',
  indoorPoolHours: '',
  kidsPoolDescription: '',
  kidsPoolHours: '',
  generalNotes: '',
}

export async function getBeachPoolsInfo(): Promise<BeachPoolsInfoData> {
  const [row] = await db.select().from(beachPoolsInfo).where(eq(beachPoolsInfo.id, 1)).limit(1)
  return row ?? DEFAULTS
}

export async function updateBeachPoolsInfo(data: BeachPoolsInfoData) {
  await db
    .insert(beachPoolsInfo)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: beachPoolsInfo.id, set: data })
  revalidatePath('/beach-pools')
}
