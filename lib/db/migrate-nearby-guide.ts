import { loadEnvConfig } from '@next/env'
import { sql } from 'drizzle-orm'

loadEnvConfig(process.cwd())

async function run() {
  const { db } = await import('./index')
  const { nearbyGuideItems: nearbyGuideItemsTable } = await import('./schema')
  const { nearbyGuideItems } = await import('../data/nearbyGuide')

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nearby_guide_items (
      id text PRIMARY KEY,
      name text NOT NULL,
      distance text NOT NULL,
      eta text NOT NULL,
      note text NOT NULL,
      phone text,
      map_query text NOT NULL,
      tone text NOT NULL,
      section text NOT NULL,
      icon_key text NOT NULL,
      order_index integer NOT NULL DEFAULT 0,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await db
    .insert(nearbyGuideItemsTable)
    .values(
      nearbyGuideItems.map((item) => ({
        id: item.id,
        name: item.name,
        distance: item.distance,
        eta: item.eta,
        note: item.note,
        phone: item.phone,
        mapQuery: item.mapQuery,
        tone: item.tone,
        section: item.section,
        iconKey: item.iconKey,
        orderIndex: item.orderIndex,
      }))
    )
    .onConflictDoNothing()

  console.log(`✓ Ensured nearby_guide_items and seeded ${nearbyGuideItems.length} rows.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})