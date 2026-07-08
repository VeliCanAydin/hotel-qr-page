// Cached readers for public guest-facing content. Every function here is
// tagged (lib/cache-tags.ts) and invalidated by the matching admin mutation,
// so public pages render from cache instead of querying Neon on every view.
//
// Each reader takes a `locale` and returns content in that language: the base
// table columns are English, and lib/translations.ts overlays any translated
// values (falling back to English when a translation is missing). `locale` is a
// parameter — never read from cookies/headers — so it is part of the 'use cache'
// key and each language gets its own cached shell. All readers also carry
// CONTENT_TAGS.translations so saving a translation refreshes every language.
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
import { TRANSLATABLE_ENTITIES } from '@/lib/i18n-entities'
import { applyTranslations, getTranslationMap, translateRows } from '@/lib/translations'
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
export async function getPublicHotelInfo(locale: string): Promise<HotelInfoData> {
  'use cache'
  cacheTag(CONTENT_TAGS.hotelInfo, CONTENT_TAGS.translations)
  cacheLife('hours')
  const [row] = await db.select().from(hotelInfo).where(eq(hotelInfo.id, 1)).limit(1)
  const base = (row ?? HOTEL_INFO_DEFAULTS) as HotelInfoData
  if (locale === 'en') return base
  const map = await getTranslationMap('hotel_info', locale)
  return applyTranslations([base], map, TRANSLATABLE_ENTITIES.hotel_info.fields, () => '1')[0]
}

export async function getPublicRestaurants(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.restaurants, CONTENT_TAGS.translations)
  cacheLife('hours')
  const rows = await db.select().from(restaurants).orderBy(asc(restaurants.orderIndex))
  return translateRows('restaurant', locale, rows, TRANSLATABLE_ENTITIES.restaurant.fields)
}

export async function getPublicRestaurantMenu(restaurantId: string, locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.restaurants, CONTENT_TAGS.menuItems, CONTENT_TAGS.translations)
  cacheLife('hours')
  const [restaurantRows, items, images, categories] = await Promise.all([
    db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1),
    db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select().from(menuItemImages),
    db.select().from(menuCategories).orderBy(asc(menuCategories.orderIndex)),
  ])
  const [restaurant] = await translateRows(
    'restaurant',
    locale,
    restaurantRows[0] ? [restaurantRows[0]] : [],
    TRANSLATABLE_ENTITIES.restaurant.fields,
  )
  const translatedItems = await translateRows('menu_item', locale, items, TRANSLATABLE_ENTITIES.menu_item.fields)
  const translatedCategories = await translateRows(
    'menu_category',
    locale,
    categories,
    TRANSLATABLE_ENTITIES.menu_category.fields,
  )
  return { restaurant: restaurant ?? null, items: translatedItems, images, categories: translatedCategories }
}

export async function getPublicRoomServiceItems(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.roomServiceItems, CONTENT_TAGS.translations)
  cacheLife('hours')
  // Sold-out items are hidden from guests; the admin page reads the table directly.
  const rows = await db.select().from(roomServiceItems).where(eq(roomServiceItems.isAvailable, true))
  return translateRows('room_service_item', locale, rows, TRANSLATABLE_ENTITIES.room_service_item.fields)
}

export async function getPublicEvents(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.events, CONTENT_TAGS.translations)
  cacheLife('hours')
  const rows = await db
    .select()
    .from(events)
    .orderBy(asc(events.date), asc(events.startTime), asc(events.title))
  return translateRows('event', locale, rows, TRANSLATABLE_ENTITIES.event.fields)
}

export async function getPublicSpaServices(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.spaServices, CONTENT_TAGS.translations)
  cacheLife('hours')
  const rows = await getSpaServices()
  return translateRows('spa_service', locale, rows, TRANSLATABLE_ENTITIES.spa_service.fields)
}

export async function getPublicWellnessServices(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.wellnessServices, CONTENT_TAGS.translations)
  cacheLife('hours')
  const rows = await getWellnessServices()
  return translateRows('wellness_service', locale, rows, TRANSLATABLE_ENTITIES.wellness_service.fields)
}

export async function getPublicBeachPoolsInfo(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.beachPools, CONTENT_TAGS.translations)
  cacheLife('hours')
  const info = await getBeachPoolsInfo()
  if (locale === 'en') return info
  const map = await getTranslationMap('beach_pools_info', locale)
  return applyTranslations([info], map, TRANSLATABLE_ENTITIES.beach_pools_info.fields, () => '1')[0]
}

export async function getPublicKidsContent(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.kidsCare, CONTENT_TAGS.translations)
  cacheLife('hours')
  const [services, serviceItems, activities] = await Promise.all([
    db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex)),
    db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.orderIndex)),
    db.select().from(kidsActivities).orderBy(asc(kidsActivities.orderIndex)),
  ])
  return {
    services: await translateRows('kids_service', locale, services, TRANSLATABLE_ENTITIES.kids_service.fields),
    serviceItems: await translateRows(
      'kids_service_item',
      locale,
      serviceItems,
      TRANSLATABLE_ENTITIES.kids_service_item.fields,
    ),
    activities: await translateRows('kids_activity', locale, activities, TRANSLATABLE_ENTITIES.kids_activity.fields),
  }
}

export async function getPublicNearbyGuideItems(locale: string) {
  'use cache'
  cacheTag(CONTENT_TAGS.nearbyGuide, CONTENT_TAGS.translations)
  cacheLife('hours')
  const rows = await getNearbyGuideItems()
  return translateRows('nearby_guide_item', locale, rows, TRANSLATABLE_ENTITIES.nearby_guide_item.fields)
}
