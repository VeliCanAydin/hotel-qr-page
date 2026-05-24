import { boolean, integer, jsonb, pgTable, real, serial, text, time, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

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
  beachOpenTime: time('beach_open_time'),
  beachCloseTime: time('beach_close_time'),
  beachNotes: text('beach_notes').notNull().default(''),
  mainPoolDescription: text('main_pool_description').notNull().default(''),
  mainPoolOpenTime: time('main_pool_open_time'),
  mainPoolCloseTime: time('main_pool_close_time'),
  indoorPoolDescription: text('indoor_pool_description').notNull().default(''),
  indoorPoolOpenTime: time('indoor_pool_open_time'),
  indoorPoolCloseTime: time('indoor_pool_close_time'),
  kidsPoolDescription: text('kids_pool_description').notNull().default(''),
  kidsPoolOpenTime: time('kids_pool_open_time'),
  kidsPoolCloseTime: time('kids_pool_close_time'),
  generalNotes: text('general_notes').notNull().default(''),
})

export const spaServices = pgTable('spa_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull().default(''),
  imageAlt: text('image_alt').notNull().default(''),
  openTime: time('open_time'),
  closeTime: time('close_time'),
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
  openTime: time('open_time'),
  closeTime: time('close_time'),
  isPaid: boolean('is_paid').notNull().default(false),
  requiresReservation: boolean('requires_reservation').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
})

export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cuisine: text('cuisine').notNull().default(''),
  openTime: time('open_time'),
  closeTime: time('close_time'),
  description: text('description').notNull().default(''),
  reservation: boolean('reservation').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
})

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  category: text('category').notNull(),
  allergens: jsonb('allergens').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  restaurantId: text('restaurant_id').notNull().default('a-la-carte'),
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
  allergens: jsonb('allergens').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
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
  serviceId: text('service_id').references(() => kidsServices.id, { onDelete: 'cascade' }),
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

export const menuTemplates = pgTable('menu_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  restaurantId: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const menuTemplateItems = pgTable('menu_template_items', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => menuTemplates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull(),
  price: real('price').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  allergens: jsonb('allergens').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  imageUrl: text('image_url'),
  orderIndex: integer('order_index').notNull().default(0),
})

export const kidsServices = pgTable('kids_services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  imageAlt: text('image_alt').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
})

export const kidsServiceItems = pgTable('kids_service_items', {
  id: text('id').primaryKey(),
  serviceId: text('service_id').notNull().references(() => kidsServices.id, { onDelete: 'cascade' }),
  trigger: text('trigger').notNull(),
  content: text('content').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// --- Access control tables ---
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  tenantId: integer('tenant_id'), // optional: for multi-tenant (hotel) setups
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  routeKey: text('route_key').notNull().unique(),
  title: text('title').notNull().default(''),
  group: text('group').notNull().default(''),
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adminUserRoles = pgTable('admin_user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
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
  cancellationReason: text('cancellation_reason').notNull().default(''),
  cancelledBy: text('cancelled_by').notNull().default(''), // 'guest' | 'staff' | ''
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reservations = pgTable('reservations', {
  id:              serial('id').primaryKey(),
  reservationCode: text('reservation_code').notNull().unique(),
  roomNumber:      text('room_number').notNull(),
  surname:         text('surname').notNull(),
  guestName:       text('guest_name').notNull(),
  roomType:        text('room_type').notNull(),
  boardType:       text('board_type').notNull(),
  status:          text('status').notNull().default('confirmed'),
  checkIn:         text('check_in').notNull(),
  checkOut:        text('check_out').notNull(),
  adults:          integer('adults').notNull().default(1),
  children:        integer('children').notNull().default(0),
  floor:           integer('floor').notNull(),
  view:            text('view').notNull().default(''),
  bedType:         text('bed_type').notNull().default(''),
  email:           text('email').notNull().default(''),
  phone:           text('phone').notNull().default(''),
  notes:           text('notes').notNull().default(''),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
})
