import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function run() {
  const rows = await db.select({ id: schema.adminUsers.id, email: schema.adminUsers.email, passwordHash: schema.adminUsers.passwordHash, roleId: schema.adminUsers.roleId }).from(schema.adminUsers)
  console.log(JSON.stringify(rows, null, 2))
}

run().catch((err) => { console.error(err); process.exit(1) })
