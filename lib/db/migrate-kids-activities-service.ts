import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = ${table} AND column_name = ${column}
  `
  return rows.length > 0
}

async function run() {
  const hasServiceId = await columnExists('kids_activities', 'service_id')

  if (hasServiceId) {
    console.log('service_id column already exists — nothing to do.')
    return
  }

  // Add column as nullable text (no FK constraint at DB level to keep migration simple)
  await sql.unsafe(`ALTER TABLE kids_activities ADD COLUMN service_id text`)
  console.log('✓ service_id column added')

  // Assign existing activities to kids-club (the original Kids Club service)
  const updated = await sql.unsafe(`
    UPDATE kids_activities SET service_id = 'kids-club' WHERE service_id IS NULL
  `)
  console.log(`✓ Assigned ${(updated as { count?: number }).count ?? '?'} existing activities to kids-club`)

  console.log('Migration complete.')
}

run().catch((err) => { console.error(err); process.exit(1) })
