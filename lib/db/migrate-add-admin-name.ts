import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  console.log('Ensuring admin_users.name column exists')
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name text DEFAULT ''`
  console.log('Done: admin_users.name')
}

run().catch((err) => { console.error(err); process.exit(1) })
