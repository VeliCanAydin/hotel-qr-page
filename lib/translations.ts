// Read/write helpers for content_translations. Server-only, and deliberately
// NOT a 'use server' module (like lib/content.ts and lib/reservations.ts):
// turning it into an action would expose these as public endpoints.
//
// English ('en') is the base language and has no rows here, so every read
// short-circuits for 'en' and every apply falls back to the base column when a
// translated value is missing or empty — the guest never sees a blank field.
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contentTranslations } from '@/lib/db/schema'

/** entityId -> { field -> translated value } for one entityType + locale. */
export type TranslationMap = Map<string, Record<string, string>>

/**
 * Load every translation for one entityType + locale into a Map. Returns an
 * empty Map for 'en' (base language) without touching the database. `locale` is
 * a plain string (the DB column is text); an unknown value simply matches no
 * rows and falls back to English.
 */
export async function getTranslationMap(entityType: string, locale: string): Promise<TranslationMap> {
  const map: TranslationMap = new Map()
  if (locale === 'en') return map

  const rows = await db
    .select({
      entityId: contentTranslations.entityId,
      field: contentTranslations.field,
      value: contentTranslations.value,
    })
    .from(contentTranslations)
    .where(and(eq(contentTranslations.entityType, entityType), eq(contentTranslations.locale, locale)))

  for (const row of rows) {
    if (!row.value) continue
    let record = map.get(row.entityId)
    if (!record) {
      record = {}
      map.set(row.entityId, record)
    }
    record[row.field] = row.value
  }
  return map
}

/**
 * Overlay translated values onto the given fields of each row. Missing/empty
 * translations leave the base (English) value untouched. Rows are copied only
 * when at least one field actually changes.
 */
export function applyTranslations<T extends object>(
  rows: T[],
  map: TranslationMap,
  fields: readonly string[],
  getId: (row: T) => string = (row) => String((row as { id: unknown }).id),
): T[] {
  if (map.size === 0) return rows
  return rows.map((row) => {
    const translation = map.get(getId(row))
    if (!translation) return row
    let next: T | null = null
    for (const field of fields) {
      const value = translation[field]
      if (value) {
        if (!next) next = { ...row }
        ;(next as Record<string, unknown>)[field] = value
      }
    }
    return next ?? row
  })
}

/** Convenience: fetch the map and apply it in one call for a single entityType. */
export async function translateRows<T extends object>(
  entityType: string,
  locale: string,
  rows: T[],
  fields: readonly string[],
  getId?: (row: T) => string,
): Promise<T[]> {
  if (locale === 'en' || rows.length === 0) return rows
  const map = await getTranslationMap(entityType, locale)
  return applyTranslations(rows, map, fields, getId)
}

/**
 * Delete every translation row for one entity. Call this from each content
 * delete action — content_translations is polymorphic, so no FK cascades it.
 */
export async function deleteTranslationsFor(entityType: string, entityId: string): Promise<void> {
  await db
    .delete(contentTranslations)
    .where(and(eq(contentTranslations.entityType, entityType), eq(contentTranslations.entityId, entityId)))
}

/** Bulk variant of deleteTranslationsFor for cascade parents. */
export async function deleteTranslationsForMany(entityType: string, entityIds: string[]): Promise<void> {
  if (entityIds.length === 0) return
  await db
    .delete(contentTranslations)
    .where(and(eq(contentTranslations.entityType, entityType), inArray(contentTranslations.entityId, entityIds)))
}

/**
 * Copy translations from one set of entities to another (fromId -> toId pairs),
 * used to carry menu-item translations across menu-template save/apply so the
 * translation effort is never silently lost. Target ids are freshly generated,
 * so existing rows are left untouched on conflict.
 */
export async function copyTranslationsBatch(
  fromType: string,
  toType: string,
  idPairs: Array<{ fromId: string; toId: string }>,
): Promise<void> {
  if (idPairs.length === 0) return

  const fromIds = idPairs.map((pair) => pair.fromId)
  const rows = await db
    .select({
      entityId: contentTranslations.entityId,
      locale: contentTranslations.locale,
      field: contentTranslations.field,
      value: contentTranslations.value,
    })
    .from(contentTranslations)
    .where(and(eq(contentTranslations.entityType, fromType), inArray(contentTranslations.entityId, fromIds)))
  if (rows.length === 0) return

  const bySource = new Map<string, typeof rows>()
  for (const row of rows) {
    const list = bySource.get(row.entityId)
    if (list) list.push(row)
    else bySource.set(row.entityId, [row])
  }

  const inserts: Array<typeof contentTranslations.$inferInsert> = []
  for (const { fromId, toId } of idPairs) {
    for (const row of bySource.get(fromId) ?? []) {
      inserts.push({ entityType: toType, entityId: toId, locale: row.locale, field: row.field, value: row.value })
    }
  }
  if (inserts.length > 0) {
    await db.insert(contentTranslations).values(inserts).onConflictDoNothing()
  }
}
