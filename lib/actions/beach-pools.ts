'use server'

import { db } from '@/lib/db'
import { beachPoolsInfo } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type BeachPoolsInfoData = {
  beachDescription: string
  beachOpenTime: string | null
  beachCloseTime: string | null
  beachNotes: string
  mainPoolDescription: string
  mainPoolOpenTime: string | null
  mainPoolCloseTime: string | null
  indoorPoolDescription: string
  indoorPoolOpenTime: string | null
  indoorPoolCloseTime: string | null
  kidsPoolDescription: string
  kidsPoolOpenTime: string | null
  kidsPoolCloseTime: string | null
  generalNotes: string
}

const DEFAULTS: BeachPoolsInfoData = {
  beachDescription: '',
  beachOpenTime: null,
  beachCloseTime: null,
  beachNotes: '',
  mainPoolDescription: '',
  mainPoolOpenTime: null,
  mainPoolCloseTime: null,
  indoorPoolDescription: '',
  indoorPoolOpenTime: null,
  indoorPoolCloseTime: null,
  kidsPoolDescription: '',
  kidsPoolOpenTime: null,
  kidsPoolCloseTime: null,
  generalNotes: '',
}

function normalizeTimeValue(value: string | null | undefined) {
  if (!value) return null
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`
  return value
}

export async function getBeachPoolsInfo(): Promise<BeachPoolsInfoData> {
  const [row] = await db.select().from(beachPoolsInfo).where(eq(beachPoolsInfo.id, 1)).limit(1)
  return row ?? DEFAULTS
}

export async function updateBeachPoolsInfo(data: BeachPoolsInfoData) {
  const toSave = {
    ...data,
    beachOpenTime: normalizeTimeValue(data.beachOpenTime),
    beachCloseTime: normalizeTimeValue(data.beachCloseTime),
    mainPoolOpenTime: normalizeTimeValue(data.mainPoolOpenTime),
    mainPoolCloseTime: normalizeTimeValue(data.mainPoolCloseTime),
    indoorPoolOpenTime: normalizeTimeValue(data.indoorPoolOpenTime),
    indoorPoolCloseTime: normalizeTimeValue(data.indoorPoolCloseTime),
    kidsPoolOpenTime: normalizeTimeValue(data.kidsPoolOpenTime),
    kidsPoolCloseTime: normalizeTimeValue(data.kidsPoolCloseTime),
  }
  await db.insert(beachPoolsInfo).values({ id: 1 }).onConflictDoNothing()
  await db.update(beachPoolsInfo).set(toSave).where(eq(beachPoolsInfo.id, 1))
  revalidatePath('/beach-pools')
}
