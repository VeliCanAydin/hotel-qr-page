import { loadEnvConfig } from '@next/env'
// Load env first (no static imports of lib/db should occur before this)
loadEnvConfig(process.cwd())

async function main() {
  try {
    // Dynamically import `db` after env is loaded so DATABASE_URL is available
    const { db } = await import('./index')
    const { guestSupportRequests } = await import('./schema')
    const rows = await db.select().from(guestSupportRequests).limit(1)
    console.log('guest_support_requests table exists. sample rows:', rows)
  } catch (err) {
    console.error('guest_support_requests table check failed:', err)
    process.exitCode = 1
  }
}

main()
