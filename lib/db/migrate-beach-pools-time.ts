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
  const table = 'beach_pools_info'

  const hasOldBeach = await columnExists(table, 'beach_hours')
  if (!hasOldBeach) {
    console.log('Already migrated — new time columns found, old text columns absent. Exiting.')
    return
  }

  const pairs = [
    ['beach_hours', 'beach_open_time', 'beach_close_time'],
    ['main_pool_hours', 'main_pool_open_time', 'main_pool_close_time'],
    ['indoor_pool_hours', 'indoor_pool_open_time', 'indoor_pool_close_time'],
    ['kids_pool_hours', 'kids_pool_open_time', 'kids_pool_close_time'],
  ]

  for (const [oldCol, openCol, closeCol] of pairs) {
    await sql.unsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${openCol} time`)
    await sql.unsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${closeCol} time`)

    // Best-effort parse of "HH:MM – HH:MM" text into open/close time columns
    await sql.unsafe(`
      UPDATE ${table}
      SET
        ${openCol} = CASE
          WHEN ${oldCol} ~ '^[0-9]{2}:[0-9]{2}' THEN (regexp_match(${oldCol}, '^([0-9]{2}:[0-9]{2})'))[1]::time
          ELSE NULL
        END,
        ${closeCol} = CASE
          WHEN ${oldCol} ~ '[0-9]{2}:[0-9]{2}$' THEN (regexp_match(${oldCol}, '([0-9]{2}:[0-9]{2})$'))[1]::time
          ELSE NULL
        END
    `)

    await sql.unsafe(`ALTER TABLE ${table} DROP COLUMN ${oldCol}`)
    console.log(`  ✓ ${oldCol} → ${openCol} / ${closeCol}`)
  }

  console.log('Migration complete.')
}

run().catch((err) => { console.error(err); process.exit(1) })
