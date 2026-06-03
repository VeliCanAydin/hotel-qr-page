import { loadEnvConfig } from '@next/env'
import { neon } from '@neondatabase/serverless'

loadEnvConfig(process.cwd())

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS guest_feedbacks (
      id serial PRIMARY KEY,
      guest_name text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '',
      room_number text NOT NULL DEFAULT '',
      stay_from text NOT NULL DEFAULT '',
      stay_to text NOT NULL DEFAULT '',
      trip_type text NOT NULL DEFAULT '',
      overall_rating integer NOT NULL,
      cleanliness_rating integer NOT NULL,
      staff_rating integer NOT NULL,
      comfort_rating integer NOT NULL,
      value_rating integer NOT NULL,
      food_rating integer NOT NULL,
      nps_score integer,
      positive text NOT NULL DEFAULT '',
      negative text NOT NULL DEFAULT '',
      staff_response text NOT NULL DEFAULT '',
      staff_action_note text NOT NULL DEFAULT '',
      staff_response_by text NOT NULL DEFAULT '',
      staff_response_at timestamp,
      consent boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `

  await sql`ALTER TABLE guest_feedbacks ADD COLUMN IF NOT EXISTS staff_response text NOT NULL DEFAULT ''`
  await sql`ALTER TABLE guest_feedbacks ADD COLUMN IF NOT EXISTS staff_action_note text NOT NULL DEFAULT ''`
  await sql`ALTER TABLE guest_feedbacks ADD COLUMN IF NOT EXISTS staff_response_by text NOT NULL DEFAULT ''`
  await sql`ALTER TABLE guest_feedbacks ADD COLUMN IF NOT EXISTS staff_response_at timestamp`

  console.log('✓ Table "guest_feedbacks" ready.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})