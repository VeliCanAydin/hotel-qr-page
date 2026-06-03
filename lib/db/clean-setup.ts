import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  console.log('Starting clean DB setup (DROP schema and recreate tables)')

  // Drop public schema (data loss — acceptable per user request)
  await sql`DROP SCHEMA IF EXISTS public CASCADE`
  await sql`CREATE SCHEMA public`
  console.log('Dropped and recreated public schema')

  // Core tables (CREATE IF NOT EXISTS for idempotence)
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id serial PRIMARY KEY,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role_id integer,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS admin_roles (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      description text DEFAULT '' NOT NULL,
      is_system boolean DEFAULT false NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS admin_role_pages (
      id serial PRIMARY KEY,
      role_id integer NOT NULL,
      page_key text NOT NULL,
      is_allowed boolean DEFAULT true NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      CONSTRAINT admin_role_pages_role_id_page_key_unique UNIQUE(role_id, page_key)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id text PRIMARY KEY,
      name text NOT NULL,
      cuisine text DEFAULT '' NOT NULL,
      open_time time,
      close_time time,
      description text DEFAULT '' NOT NULL,
      reservation boolean DEFAULT false NOT NULL,
      order_index integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id text PRIMARY KEY,
      label text NOT NULL,
      order_index integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      price real NOT NULL,
      is_vegetarian boolean DEFAULT false NOT NULL,
      category text NOT NULL,
      restaurant_id text DEFAULT 'a-la-carte' NOT NULL,
      allergens jsonb NOT NULL DEFAULT '[]'::jsonb
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_item_images (
      item_id text PRIMARY KEY,
      proxy_url text NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_templates (
      id text PRIMARY KEY,
      name text NOT NULL,
      restaurant_id text NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_template_items (
      id text PRIMARY KEY,
      template_id text NOT NULL,
      name text NOT NULL,
      description text DEFAULT '' NOT NULL,
      category text NOT NULL,
      price real NOT NULL,
      is_vegetarian boolean DEFAULT false NOT NULL,
      image_url text,
      order_index integer DEFAULT 0 NOT NULL,
      allergens jsonb NOT NULL DEFAULT '[]'::jsonb
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS room_service_items (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      price real NOT NULL,
      category text NOT NULL,
      allergens jsonb NOT NULL DEFAULT '[]'::jsonb
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS room_service_orders (
      id serial PRIMARY KEY,
      reservation_code text NOT NULL,
      room_number text NOT NULL,
      guest_surname text NOT NULL,
      items text NOT NULL,
      total_amount real NOT NULL,
      note text DEFAULT '' NOT NULL,
      status text DEFAULT 'pending' NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id text PRIMARY KEY,
      title text NOT NULL,
      description text NOT NULL,
      location text NOT NULL,
      date text NOT NULL,
      start_time text NOT NULL,
      end_time text NOT NULL,
      category text NOT NULL,
      color text
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS kids_activities (
      id serial PRIMARY KEY,
      day text NOT NULL,
      time text NOT NULL,
      event text NOT NULL,
      order_index integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS hotel_info (
      id integer PRIMARY KEY DEFAULT 1,
      phone text DEFAULT '' NOT NULL,
      email text DEFAULT '' NOT NULL,
      whatsapp text DEFAULT '' NOT NULL,
      wifi_name text DEFAULT '' NOT NULL,
      wifi_password text DEFAULT '' NOT NULL,
      check_in_start text DEFAULT '' NOT NULL,
      check_in_end text DEFAULT '' NOT NULL,
      check_out text DEFAULT '' NOT NULL,
      cancellation_policy text DEFAULT '' NOT NULL,
      about_text text DEFAULT '' NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS beach_pools_info (
      id integer PRIMARY KEY DEFAULT 1,
      beach_description text DEFAULT '' NOT NULL,
      beach_open_time time,
      beach_close_time time,
      beach_notes text DEFAULT '' NOT NULL,
      main_pool_description text DEFAULT '' NOT NULL,
      main_pool_open_time time,
      main_pool_close_time time,
      indoor_pool_description text DEFAULT '' NOT NULL,
      indoor_pool_open_time time,
      indoor_pool_close_time time,
      kids_pool_description text DEFAULT '' NOT NULL,
      kids_pool_open_time time,
      kids_pool_close_time time,
      general_notes text DEFAULT '' NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS spa_services (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      image text DEFAULT '' NOT NULL,
      image_alt text DEFAULT '' NOT NULL,
      open_time time,
      close_time time,
      is_free boolean DEFAULT true NOT NULL,
      price text DEFAULT '' NOT NULL,
      requires_reservation boolean DEFAULT false NOT NULL,
      tags text DEFAULT '' NOT NULL,
      order_index integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS wellness_services (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      image text DEFAULT '' NOT NULL,
      image_alt text DEFAULT '' NOT NULL,
      open_time time,
      close_time time,
      is_paid boolean DEFAULT false NOT NULL,
      requires_reservation boolean DEFAULT false NOT NULL,
      order_index integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS allergens (
      id text PRIMARY KEY,
      label text NOT NULL,
      icon_path text NOT NULL DEFAULT '',
      order_index integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `

  // Foreign keys
  await sql`ALTER TABLE admin_role_pages ADD CONSTRAINT IF NOT EXISTS admin_role_pages_role_id_admin_roles_id_fk FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE cascade`
  await sql`ALTER TABLE admin_users ADD CONSTRAINT IF NOT EXISTS admin_users_role_id_admin_roles_id_fk FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE set null`
  await sql`ALTER TABLE menu_template_items ADD CONSTRAINT IF NOT EXISTS menu_template_items_template_id_menu_templates_id_fk FOREIGN KEY (template_id) REFERENCES menu_templates(id) ON DELETE cascade`
  await sql`ALTER TABLE menu_templates ADD CONSTRAINT IF NOT EXISTS menu_templates_restaurant_id_restaurants_id_fk FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE cascade`

  console.log('Schema setup complete.')
}

run().catch((err) => { console.error(err); process.exit(1) })
