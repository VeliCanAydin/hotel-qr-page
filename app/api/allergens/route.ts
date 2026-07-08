import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { allergens as allergensTable } from '@/lib/db/schema'
import { ALLERGENS } from '@/lib/data/allergens'
import { TRANSLATABLE_ENTITIES } from '@/lib/i18n-entities'
import { applyTranslations, getTranslationMap } from '@/lib/translations'

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale') ?? 'en'
  try {
    const rows = await db.select().from(allergensTable).orderBy(allergensTable.orderIndex)
    if (rows.length === 0) {
      // Static fallback is English-only; guests still get readable labels.
      return NextResponse.json(ALLERGENS)
    }

    const mapped = rows.map((r) => ({ id: r.id, label: r.label, icon: r.iconPath }))
    if (locale !== 'en') {
      const map = await getTranslationMap('allergen', locale)
      return NextResponse.json(applyTranslations(mapped, map, TRANSLATABLE_ENTITIES.allergen.fields))
    }
    return NextResponse.json(mapped)
  } catch (err) {
    return NextResponse.json(ALLERGENS)
  }
}
