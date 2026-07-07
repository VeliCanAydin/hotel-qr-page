import { boolean, integer, pgTable, real, serial, text, time, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

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
  allergens: text('allergens').notNull().default('[]'),
  category: text('category').notNull(),
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
  // Kitchen's "sold out" switch — hidden from guests and rejected in orders while false
  isAvailable: boolean('is_available').notNull().default(true),
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

export const nearbyGuideItems = pgTable('nearby_guide_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  distance: text('distance').notNull(),
  eta: text('eta').notNull(),
  note: text('note').notNull(),
  phone: text('phone'),
  mapQuery: text('map_query').notNull(),
  tone: text('tone').notNull(),
  section: text('section').notNull(),
  iconKey: text('icon_key').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  allergens: text('allergens').notNull().default('[]'),
  imageUrl: text('image_url'),
  orderIndex: integer('order_index').notNull().default(0),
})

export const allergens = pgTable('allergens', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  iconPath: text('icon_path').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export const adminRoles = pgTable('admin_roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adminRolePages = pgTable('admin_role_pages', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').notNull().references(() => adminRoles.id, { onDelete: 'cascade' }),
  pageKey: text('page_key').notNull(),
  isAllowed: boolean('is_allowed').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  rolePageUnique: uniqueIndex('admin_role_pages_role_id_page_key_unique').on(table.roleId, table.pageKey),
}))

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => adminRoles.id, { onDelete: 'set null' }),
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
  cancellationReason: text('cancellation_reason').notNull().default(''),
  cancelledBy: text('cancelled_by').notNull().default(''), // 'guest' | 'staff' | ''
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const guestFeedbacks = pgTable('guest_feedbacks', {
  id: serial('id').primaryKey(),
  guestName: text('guest_name').notNull().default(''),
  email: text('email').notNull().default(''),
  roomNumber: text('room_number').notNull().default(''),
  stayFrom: text('stay_from').notNull().default(''),
  stayTo: text('stay_to').notNull().default(''),
  tripType: text('trip_type').notNull().default(''),
  overallRating: integer('overall_rating').notNull(),
  // Category ratings are null when the guest never opened the detailed
  // rating section — a stored value always reflects an explicit choice.
  cleanlinessRating: integer('cleanliness_rating'),
  staffRating: integer('staff_rating'),
  comfortRating: integer('comfort_rating'),
  valueRating: integer('value_rating'),
  foodRating: integer('food_rating'),
  npsScore: integer('nps_score'),
  positive: text('positive').notNull().default(''),
  negative: text('negative').notNull().default(''),
  staffResponse: text('staff_response').notNull().default(''),
  staffActionNote: text('staff_action_note').notNull().default(''),
  staffResponseBy: text('staff_response_by').notNull().default(''),
  staffResponseAt: timestamp('staff_response_at'),
  consent: boolean('consent').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const guestSupportRequests = pgTable('guest_support_requests', {
  id: serial('id').primaryKey(),
  guestName: text('guest_name').notNull().default(''),
  roomNumber: text('room_number').notNull().default(''),
  requestType: text('request_type').notNull().default('support'), // 'support' | 'complaint'
  issueCategory: text('issue_category').notNull().default('other'),
  subject: text('subject').notNull().default(''),
  message: text('message').notNull().default(''),
  imageUrl: text('image_url').notNull().default(''),
  status: text('status').notNull().default('open'),
  staffResponse: text('staff_response').notNull().default(''),
  staffResponseBy: text('staff_response_by').notNull().default(''),
  staffResponseAt: timestamp('staff_response_at'),
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
