import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function tableExists(table: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_name = ${table}
  `
  return rows.length > 0
}

async function run() {
  const servicesExists = await tableExists('kids_services')
  const itemsExists = await tableExists('kids_service_items')

  if (servicesExists && itemsExists) {
    console.log('Tables already exist — nothing to do.')
    return
  }

  if (!servicesExists) {
    await sql.unsafe(`
      CREATE TABLE kids_services (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text NOT NULL DEFAULT '',
        image text NOT NULL DEFAULT '',
        image_alt text NOT NULL DEFAULT '',
        order_index integer NOT NULL DEFAULT 0
      )
    `)
    console.log('✓ kids_services table created')
  }

  if (!itemsExists) {
    await sql.unsafe(`
      CREATE TABLE kids_service_items (
        id text PRIMARY KEY,
        service_id text NOT NULL REFERENCES kids_services(id) ON DELETE CASCADE,
        trigger text NOT NULL,
        content text NOT NULL,
        order_index integer NOT NULL DEFAULT 0
      )
    `)
    console.log('✓ kids_service_items table created')
  }

  console.log('Migration complete.')
}

run().catch((err) => { console.error(err); process.exit(1) })
