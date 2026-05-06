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
  const table = 'room_service_orders'
  const column = 'cancellation_reason'

  if (await columnExists(table, column)) {
    console.log(`Column "${column}" already exists on "${table}". Skipping.`)
    return
  }

  await sql.unsafe(
    `ALTER TABLE ${table} ADD COLUMN ${column} text NOT NULL DEFAULT ''`
  )
  console.log(`✓ Added "${column}" to "${table}".`)
}

run().catch((err) => { console.error(err); process.exit(1) })
