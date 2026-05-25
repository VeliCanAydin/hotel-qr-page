import { loadEnvConfig } from '@next/env'
import { neon } from '@neondatabase/serverless'

loadEnvConfig(process.cwd())

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  // Add allergens column to menu_items and menu_template_items as text (JSON array stored as string)
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens text NOT NULL DEFAULT '[]'`
  await sql`ALTER TABLE menu_template_items ADD COLUMN IF NOT EXISTS allergens text NOT NULL DEFAULT '[]'`

  console.log('✓ Columns "allergens" ensured on menu_items and menu_template_items.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
