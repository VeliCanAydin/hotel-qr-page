CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "beach_pools_info" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"beach_description" text DEFAULT '' NOT NULL,
	"beach_open_time" time,
	"beach_close_time" time,
	"beach_notes" text DEFAULT '' NOT NULL,
	"main_pool_description" text DEFAULT '' NOT NULL,
	"main_pool_open_time" time,
	"main_pool_close_time" time,
	"indoor_pool_description" text DEFAULT '' NOT NULL,
	"indoor_pool_open_time" time,
	"indoor_pool_close_time" time,
	"kids_pool_description" text DEFAULT '' NOT NULL,
	"kids_pool_open_time" time,
	"kids_pool_close_time" time,
	"general_notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"category" text NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "hotel_info" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"wifi_name" text DEFAULT '' NOT NULL,
	"wifi_password" text DEFAULT '' NOT NULL,
	"check_in_start" text DEFAULT '' NOT NULL,
	"check_in_end" text DEFAULT '' NOT NULL,
	"check_out" text DEFAULT '' NOT NULL,
	"cancellation_policy" text DEFAULT '' NOT NULL,
	"about_text" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kids_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"time" text NOT NULL,
	"event" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_item_images" (
	"item_id" text PRIMARY KEY NOT NULL,
	"proxy_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"category" text NOT NULL,
	"restaurant_id" text DEFAULT 'a-la-carte' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_template_items" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"price" real NOT NULL,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"restaurant_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cuisine" text DEFAULT '' NOT NULL,
	"open_time" time,
	"close_time" time,
	"description" text DEFAULT '' NOT NULL,
	"reservation" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_service_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_service_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_code" text NOT NULL,
	"room_number" text NOT NULL,
	"guest_surname" text NOT NULL,
	"items" text NOT NULL,
	"total_amount" real NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spa_services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_free" boolean DEFAULT true NOT NULL,
	"price" text DEFAULT '' NOT NULL,
	"requires_reservation" boolean DEFAULT false NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_paid" boolean DEFAULT false NOT NULL,
	"requires_reservation" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_template_items" ADD CONSTRAINT "menu_template_items_template_id_menu_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."menu_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_templates" ADD CONSTRAINT "menu_templates_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;