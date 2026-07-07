// Cached readers for public guest-facing content. Every function here is
// tagged (lib/cache-tags.ts) and invalidated by the matching admin mutation,
// so public pages render from cache instead of querying Neon on every view.
//
// Admin pages keep using the uncached getters in lib/actions/* — this module
// is for the guest site only. Like lib/reservations.ts, it is server-only and
// deliberately NOT a 'use server' module.
import { asc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/lib/db'
import {
  events,
  hotelInfo,
  kidsActivities,
  kidsServiceItems,
  kidsServices,
  menuCategories,
  menuItemImages,
  menuItems,
  restaurants,
  roomServiceItems,
} from '@/lib/db/schema'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import type { HotelInfoData } from '@/lib/actions/hotel-info'
import { getSpaServices } from '@/lib/actions/spa-services'
import { getWellnessServices } from '@/lib/actions/wellness-services'
import { getBeachPoolsInfo } from '@/lib/actions/beach-pools'
import { getNearbyGuideItems } from '@/lib/actions/nearby-guide'

const HOTEL_INFO_DEFAULTS: HotelInfoData = {
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

/** Includes wifiPassword — render it only behind a guest-session check. */
export async function getPublicHotelInfo(): Promise<HotelInfoData> {
  'use cache'
  cacheTag(CONTENT_TAGS.hotelInfo)
  cacheLife('hours')
  const [row] = await db.select().from(hotelInfo).where(eq(hotelInfo.id, 1)).limit(1)
  return row ?? HOTEL_INFO_DEFAULTS
}

export async function getPublicRestaurants() {
  'use cache'
  cacheTag(CONTENT_TAGS.restaurants)
  cacheLife('hours')
  return db.select().from(restaurants).orderBy(asc(restaurants.orderIndex))
}

export async function getPublicRestaurantMenu(restaurantId: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.restaurants, CONTENT_TAGS.menuItems)
  cacheLife('hours')
  const [restaurantRows, items, images, categories] = await Promise.all([
    db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1),
    db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select().from(menuItemImages),
    db.select().from(menuCategories).orderBy(asc(menuCategories.orderIndex)),
  ])
  return { restaurant: restaurantRows[0] ?? null, items, images, categories }
}

export async function getPublicRoomServiceItems() {
  'use cache'
  cacheTag(CONTENT_TAGS.roomServiceItems)
  cacheLife('hours')
  return db.select().from(roomServiceItems)
}

export async function getPublicEvents() {
  'use cache'
  cacheTag(CONTENT_TAGS.events)
  cacheLife('hours')
  return db
    .select()
    .from(events)
    .orderBy(asc(events.date), asc(events.startTime), asc(events.title))
}

export async function getPublicSpaServices() {
  'use cache'
  cacheTag(CONTENT_TAGS.spaServices)
  cacheLife('hours')
  return getSpaServices()
}

export async function getPublicWellnessServices() {
  'use cache'
  cacheTag(CONTENT_TAGS.wellnessServices)
  cacheLife('hours')
  return getWellnessServices()
}

export async function getPublicBeachPoolsInfo() {
  'use cache'
  cacheTag(CONTENT_TAGS.beachPools)
  cacheLife('hours')
  return getBeachPoolsInfo()
}

export async function getPublicKidsContent() {
  'use cache'
  cacheTag(CONTENT_TAGS.kidsCare)
  cacheLife('hours')
  const [services, serviceItems, activities] = await Promise.all([
    db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex)),
    db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.orderIndex)),
    db.select().from(kidsActivities).orderBy(asc(kidsActivities.orderIndex)),
  ])
  return { services, serviceItems, activities }
}

export async function getPublicNearbyGuideItems() {
  'use cache'
  cacheTag(CONTENT_TAGS.nearbyGuide)
  cacheLife('hours')
  return getNearbyGuideItems()
}
