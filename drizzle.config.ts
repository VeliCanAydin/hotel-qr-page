import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

loadEnvConfig(process.cwd())

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // The external AI chat backend (AI_BACKEND_URL) shares this Neon database and
  // owns these tables — without the filter, `db:push` offers to DROP them.
  tablesFilter: ['!agent_logs', '!semantic_cache', '!chat_sessions', '!messages', '!documents'],
})
