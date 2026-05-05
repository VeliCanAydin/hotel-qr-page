import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function getColumnType(table: string, column: string): Promise<string> {
  const rows = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = ${table} AND column_name = ${column}
  `
  return rows[0]?.data_type ?? 'unknown'
}

async function migrateIfNeeded(table: string) {
  const type = await getColumnType(table, 'open_time')
  if (type === 'time without time zone') {
    console.log(`  skipping ${table} (already TIME)`)
    return
  }
  // Still text — drop default, null out empty strings, then cast
  await sql.unsafe(`ALTER TABLE ${table} ALTER COLUMN open_time DROP DEFAULT`)
  await sql.unsafe(`ALTER TABLE ${table} ALTER COLUMN close_time DROP DEFAULT`)
  await sql.unsafe(`UPDATE ${table} SET open_time = NULL WHERE open_time = ''`)
  await sql.unsafe(`UPDATE ${table} SET close_time = NULL WHERE close_time = ''`)
  await sql.unsafe(`ALTER TABLE ${table} ALTER COLUMN open_time TYPE time USING open_time::time`)
  await sql.unsafe(`ALTER TABLE ${table} ALTER COLUMN close_time TYPE time USING close_time::time`)
  console.log(`  ✓ ${table} migrated`)
}

async function run() {
  for (const table of ['restaurants', 'spa_services', 'wellness_services']) {
    await migrateIfNeeded(table)
  }
  console.log('All done.')
}

run().catch((err) => { console.error(err); process.exit(1) })
