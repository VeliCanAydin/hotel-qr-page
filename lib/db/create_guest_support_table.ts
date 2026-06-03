import { readFileSync } from 'fs'
import { join } from 'path'
import { neon } from '@neondatabase/serverless'
import { loadEnvConfig } from '@next/env'

// Load .env.local into process.env (same as Next.js)
loadEnvConfig(process.cwd())
async function main() {
  const sqlFile = join(process.cwd(), 'lib', 'db', 'migrations', '0001_create_guest_support_requests.sql')
  const sql = readFileSync(sqlFile, 'utf8')

  const client = neon(process.env.DATABASE_URL!)
  try {
    console.log('Connecting to DB and applying guest_support_requests migration...')
    const res = await client.query(sql)
    console.log('Migration applied:', res)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exitCode = 1
  } finally {
    // neon() client does not expose an `end()` method in this runtime helper.
    // No explicit cleanup required here.
  }
}

main()
