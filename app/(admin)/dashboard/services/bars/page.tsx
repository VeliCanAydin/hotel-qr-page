import { db } from '@/lib/db'
import { barMenuItems, barMenuCategories } from '@/lib/db/schema'
import { getBars } from '@/lib/actions/bars'
import { asc } from 'drizzle-orm'
import BarsClient from './bars-client'

export default async function BarsPage() {
  const [barRows, itemRows, categoryRows] = await Promise.all([
    getBars(),
    db.select().from(barMenuItems).orderBy(asc(barMenuItems.orderIndex)),
    db.select().from(barMenuCategories).orderBy(asc(barMenuCategories.orderIndex)),
  ])

  return (
    <BarsClient
      initialBars={barRows}
      initialItems={itemRows}
      initialCategories={categoryRows}
    />
  )
}
