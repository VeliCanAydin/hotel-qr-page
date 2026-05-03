import { boolean, integer, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const hotelInfo = pgTable('hotel_info', {
  id: integer('id').primaryKey().default(1),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  whatsapp: text('whatsapp').notNull().default(''),
  wifiName: text('wifi_name').notNull().default(''),
  wifiPassword: text('wifi_password').notNull().default(''),
  checkInStart: text('check_in_start').notNull().default(''),
  checkInEnd: text('check_in_end').notNull().default(''),
  checkOut: text('check_out').notNull().default(''),
  cancellationPolicy: text('cancellation_policy').notNull().default(''),
  aboutText: text('about_text').notNull().default(''),
})

export const beachPoolsInfo = pgTable('beach_pools_info', {
  id: integer('id').primaryKey().default(1),
  beachDescription: text('beach_description').notNull().default(''),
  beachHours: text('beach_hours').notNull().default(''),
  beachNotes: text('beach_notes').notNull().default(''),
  mainPoolDescription: text('main_pool_description').notNull().default(''),
  mainPoolHours: text('main_pool_hours').notNull().default(''),
  indoorPoolDescription: text('indoor_pool_description').notNull().default(''),
  indoorPoolHours: text('indoor_pool_hours').notNull().default(''),
  kidsPoolDescription: text('kids_pool_description').notNull().default(''),
  kidsPoolHours: text('kids_pool_hours').notNull().default(''),
  generalNotes: text('general_notes').notNull().default(''),
})

export const spaServices = pgTable('spa_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull().default(''),
  imageAlt: text('image_alt').notNull().default(''),
  hours: text('hours').notNull().default(''),
  isFree: boolean('is_free').notNull().default(true),
  price: text('price').notNull().default(''),
  requiresReservation: boolean('requires_reservation').notNull().default(false),
  tags: text('tags').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
})

export const wellnessServices = pgTable('wellness_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull().default(''),
  imageAlt: text('image_alt').notNull().default(''),
  hours: text('hours').notNull().default(''),
  isPaid: boolean('is_paid').notNull().default(false),
  requiresReservation: boolean('requires_reservation').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
})

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  category: text('category').notNull(),
})

export const menuItemImages = pgTable('menu_item_images', {
  itemId: text('item_id').primaryKey(),
  proxyUrl: text('proxy_url').notNull(),
})

export const roomServiceItems = pgTable('room_service_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  category: text('category').notNull(),
})

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  category: text('category').notNull(),
  color: text('color'),
})

export const kidsActivities = pgTable('kids_activities', {
  id: serial('id').primaryKey(),
  day: text('day').notNull(),
  time: text('time').notNull(),
  event: text('event').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const menuCategories = pgTable('menu_categories', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const roomServiceOrders = pgTable('room_service_orders', {
  id: serial('id').primaryKey(),
  reservationCode: text('reservation_code').notNull(), // unique per stay — prevents cross-stay conflicts
  roomNumber: text('room_number').notNull(),
  guestSurname: text('guest_surname').notNull(),
  items: text('items').notNull(), // JSON: OrderItem[]
  totalAmount: real('total_amount').notNull(),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
