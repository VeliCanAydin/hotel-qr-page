import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'
import { mockReservations } from '../data/mockReservations'

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  // CREATE TABLE IF NOT EXISTS — safe to run multiple times
  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id               serial PRIMARY KEY,
      reservation_code text NOT NULL UNIQUE,
      room_number      text NOT NULL,
      surname          text NOT NULL,
      guest_name       text NOT NULL,
      room_type        text NOT NULL,
      board_type       text NOT NULL,
      status           text NOT NULL DEFAULT 'confirmed',
      check_in         text NOT NULL,
      check_out        text NOT NULL,
      adults           integer NOT NULL DEFAULT 1,
      children         integer NOT NULL DEFAULT 0,
      floor            integer NOT NULL,
      view             text NOT NULL DEFAULT '',
      bed_type         text NOT NULL DEFAULT '',
      email            text NOT NULL DEFAULT '',
      phone            text NOT NULL DEFAULT '',
      notes            text NOT NULL DEFAULT '',
      created_at       timestamp DEFAULT now() NOT NULL
    )
  `
  console.log('✓ Table "reservations" ready.')

  let seeded = 0
  for (const r of mockReservations) {
    const result = await sql`
      INSERT INTO reservations
        (reservation_code, room_number, surname, guest_name, room_type, board_type,
         status, check_in, check_out, adults, children, floor, view, bed_type,
         email, phone, notes)
      VALUES
        (${r.reservationCode}, ${r.roomNumber}, ${r.surname}, ${r.guestName},
         ${r.roomType}, ${r.boardType}, ${r.status}, ${r.checkIn}, ${r.checkOut},
         ${r.adults}, ${r.children}, ${r.floor}, ${r.view}, ${r.bedType},
         ${r.email}, ${r.phone}, ${r.notes ?? ''})
      ON CONFLICT (reservation_code) DO NOTHING
    `
    if (result.length === 0) seeded++
  }

  if (seeded > 0) {
    console.log(`✓ Seeded ${seeded} reservation(s).`)
  } else {
    console.log('Data already present — skipping seed.')
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
