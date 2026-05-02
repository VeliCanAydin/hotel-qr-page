'use server'

import { db } from '@/lib/db'
import { hotelInfo } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type HotelInfoData = {
  phone: string
  email: string
  whatsapp: string
  wifiName: string
  wifiPassword: string
  checkInStart: string
  checkInEnd: string
  checkOut: string
  cancellationPolicy: string
  aboutText: string
}

const DEFAULTS: HotelInfoData = {
  phone: '',
  email: '',
  whatsapp: '',
  wifiName: '',
  wifiPassword: '',
  checkInStart: '',
  checkInEnd: '',
  checkOut: '',
  cancellationPolicy: '',
  aboutText: '',
}

export async function getHotelInfo(): Promise<HotelInfoData> {
  const [row] = await db.select().from(hotelInfo).where(eq(hotelInfo.id, 1)).limit(1)
  return row ?? DEFAULTS
}

export async function updateHotelInfo(data: HotelInfoData) {
  await db
    .insert(hotelInfo)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: hotelInfo.id, set: data })
  revalidatePath('/hotel-info')
}
