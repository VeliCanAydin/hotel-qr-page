'use server'

import { asc, and, eq, sql } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { db } from '@/lib/db'
import {
  allergens,
  beachPoolsInfo,
  contentTranslations,
  events,
  hotelInfo,
  kidsActivities,
  kidsServiceItems,
  kidsServices,
  menuCategories,
  menuItems,
  nearbyGuideItems,
  restaurants,
  roomServiceItems,
  spaServices,
  wellnessServices,
} from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'
import { CONTENT_TAGS } from '@/lib/cache-tags'
import { LOCALES, type Locale } from '@/i18n/routing'
import { TRANSLATABLE_ENTITIES, type TranslatableEntityType } from '@/lib/i18n-entities'

const PAGE_HREF = '/dashboard/content/translations'

// Locales the admin can translate into — 'en' is the base language and lives in
// the content tables themselves.
const TARGET_LOCALES = LOCALES.filter((locale) => locale !== 'en')

export type TranslationSourceRow = {
  entityId: string
  entityLabel: string
  fields: Array<{ field: string; source: string; value: string }>
}

type SourceRecord = { id: string; label: string; values: Record<string, string> }

const str = (value: unknown) => (value == null ? '' : String(value))

// English source rows per entity type, read uncached (admin side never goes
// through lib/content.ts — that's the guest-facing cached layer).
const ENTITY_SOURCES: Record<TranslatableEntityType, () => Promise<SourceRecord[]>> = {
  hotel_info: async () => {
    const [row] = await db.select().from(hotelInfo).limit(1)
    if (!row) return []
    return [{
      id: '1',
      label: 'Hotel Information',
      values: { cancellationPolicy: row.cancellationPolicy, aboutText: row.aboutText },
    }]
  },
  beach_pools_info: async () => {
    const [row] = await db.select().from(beachPoolsInfo).limit(1)
    if (!row) return []
    return [{
      id: '1',
      label: 'Beach & Pools',
      values: {
        beachDescription: row.beachDescription,
        beachNotes: row.beachNotes,
        mainPoolDescription: row.mainPoolDescription,
        indoorPoolDescription: row.indoorPoolDescription,
        kidsPoolDescription: row.kidsPoolDescription,
        generalNotes: row.generalNotes,
      },
    }]
  },
  spa_service: async () => {
    const rows = await db.select().from(spaServices).orderBy(asc(spaServices.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      values: { name: row.name, description: row.description, tags: row.tags },
    }))
  },
  wellness_service: async () => {
    const rows = await db.select().from(wellnessServices).orderBy(asc(wellnessServices.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      values: { name: row.name, description: row.description },
    }))
  },
  restaurant: async () => {
    const rows = await db.select().from(restaurants).orderBy(asc(restaurants.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      values: { name: row.name, cuisine: row.cuisine, description: row.description },
    }))
  },
  menu_item: async () => {
    const restaurantRows = await db.select({ id: restaurants.id, name: restaurants.name }).from(restaurants)
    const restaurantNames = new Map(restaurantRows.map((row) => [row.id, row.name]))
    const rows = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.restaurantId), asc(menuItems.category), asc(menuItems.name))
    return rows.map((row) => ({
      id: row.id,
      label: `${row.name} — ${restaurantNames.get(row.restaurantId) ?? row.restaurantId}`,
      values: { name: row.name, description: row.description },
    }))
  },
  room_service_item: async () => {
    const rows = await db
      .select()
      .from(roomServiceItems)
      .orderBy(asc(roomServiceItems.category), asc(roomServiceItems.name))
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      values: { name: row.name, description: row.description },
    }))
  },
  event: async () => {
    const rows = await db.select().from(events).orderBy(asc(events.date), asc(events.startTime))
    return rows.map((row) => ({
      id: row.id,
      label: `${row.title} (${row.date})`,
      values: { title: row.title, description: row.description, location: row.location },
    }))
  },
  nearby_guide_item: async () => {
    const rows = await db.select().from(nearbyGuideItems).orderBy(asc(nearbyGuideItems.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      values: { name: row.name, note: row.note, distance: row.distance, eta: row.eta },
    }))
  },
  kids_service: async () => {
    const rows = await db.select().from(kidsServices).orderBy(asc(kidsServices.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.title,
      values: { title: row.title, description: row.description },
    }))
  },
  kids_service_item: async () => {
    const rows = await db.select().from(kidsServiceItems).orderBy(asc(kidsServiceItems.serviceId), asc(kidsServiceItems.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.trigger,
      values: { trigger: row.trigger, content: row.content },
    }))
  },
  kids_activity: async () => {
    const rows = await db.select().from(kidsActivities).orderBy(asc(kidsActivities.day), asc(kidsActivities.orderIndex))
    return rows.map((row) => ({
      id: String(row.id),
      label: `${row.day} ${row.time}`,
      values: { event: row.event },
    }))
  },
  menu_category: async () => {
    const rows = await db.select().from(menuCategories).orderBy(asc(menuCategories.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      values: { label: row.label },
    }))
  },
  allergen: async () => {
    const rows = await db.select().from(allergens).orderBy(asc(allergens.orderIndex))
    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      values: { label: row.label },
    }))
  },
}

function assertEntityType(entityType: string): asserts entityType is TranslatableEntityType {
  if (!(entityType in TRANSLATABLE_ENTITIES)) {
    throw new Error(`Unknown translatable entity type: ${entityType}`)
  }
}

function assertTargetLocale(locale: string): asserts locale is Locale {
  if (!(TARGET_LOCALES as readonly string[]).includes(locale)) {
    throw new Error(`Unsupported target locale: ${locale}`)
  }
}

/** English source rows + existing translations for one entity type and locale. */
export async function getTranslationEntries(
  entityType: string,
  locale: string,
): Promise<TranslationSourceRow[]> {
  await requireAdmin(PAGE_HREF)
  assertEntityType(entityType)
  assertTargetLocale(locale)

  const [sourceRows, translationRows] = await Promise.all([
    ENTITY_SOURCES[entityType](),
    db
      .select({
        entityId: contentTranslations.entityId,
        field: contentTranslations.field,
        value: contentTranslations.value,
      })
      .from(contentTranslations)
      .where(and(eq(contentTranslations.entityType, entityType), eq(contentTranslations.locale, locale))),
  ])

  const translated = new Map<string, string>()
  for (const row of translationRows) {
    translated.set(`${row.entityId}::${row.field}`, row.value)
  }

  const fields = TRANSLATABLE_ENTITIES[entityType].fields
  return sourceRows.map((row) => ({
    entityId: row.id,
    entityLabel: row.label,
    fields: fields.map((field) => ({
      field,
      source: str(row.values[field]),
      value: translated.get(`${row.id}::${field}`) ?? '',
    })),
  }))
}

export type TranslationChange = {
  entityId: string
  field: string
  value: string
}

/**
 * Bulk-save edited cells for one entity type + locale. Empty values delete the
 * row (guest falls back to English); non-empty values upsert. Ends by
 * invalidating the shared translations cache tag so every locale refreshes.
 */
export async function saveTranslations(
  entityType: string,
  locale: string,
  changes: TranslationChange[],
): Promise<void> {
  await requireAdmin(PAGE_HREF)
  assertEntityType(entityType)
  assertTargetLocale(locale)

  const allowedFields: readonly string[] = TRANSLATABLE_ENTITIES[entityType].fields
  for (const change of changes) {
    if (!allowedFields.includes(change.field)) {
      throw new Error(`Field "${change.field}" is not translatable for ${entityType}`)
    }
  }

  const deletions = changes.filter((change) => change.value.trim() === '')
  const upserts = changes.filter((change) => change.value.trim() !== '')

  for (const change of deletions) {
    await db
      .delete(contentTranslations)
      .where(
        and(
          eq(contentTranslations.entityType, entityType),
          eq(contentTranslations.entityId, change.entityId),
          eq(contentTranslations.locale, locale),
          eq(contentTranslations.field, change.field),
        ),
      )
  }

  if (upserts.length > 0) {
    await db
      .insert(contentTranslations)
      .values(
        upserts.map((change) => ({
          entityType,
          entityId: change.entityId,
          locale,
          field: change.field,
          value: change.value,
        })),
      )
      .onConflictDoUpdate({
        target: [
          contentTranslations.entityType,
          contentTranslations.entityId,
          contentTranslations.locale,
          contentTranslations.field,
        ],
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date(),
        },
      })
  }

  updateTag(CONTENT_TAGS.translations)
}
