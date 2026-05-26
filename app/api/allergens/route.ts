import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { allergens as allergensTable } from '@/lib/db/schema'
import { ALLERGENS } from '@/lib/data/allergens'

export async function GET() {
  try {
    const rows = await db.select().from(allergensTable).orderBy(allergensTable.orderIndex)
    if (rows.length === 0) {
      return NextResponse.json(ALLERGENS)
    }

    const mapped = rows.map((r) => ({ id: r.id, label: r.label, icon: r.iconPath }))
    return NextResponse.json(mapped)
  } catch (err) {
    return NextResponse.json(ALLERGENS)
  }
}
