'use server'

import { db } from '@/lib/db'
import { hotelInfo } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'

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

// Admin-only: includes wifiPassword. The public site reads the cached copy in
// lib/content.ts instead, so this action must not be callable anonymously.
export async function getHotelInfo(): Promise<HotelInfoData> {
  await requireAdmin('/dashboard/content/hotel-info')
  const [row] = await db.select().from(hotelInfo).where(eq(hotelInfo.id, 1)).limit(1)
  return row ?? DEFAULTS
}

export async function updateHotelInfo(data: HotelInfoData) {
  await requireAdmin('/dashboard/content/hotel-info')
  await db
    .insert(hotelInfo)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: hotelInfo.id, set: data })
  updateTag(CONTENT_TAGS.hotelInfo)
}
