CREATE TABLE "admin_role_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"page_key" text NOT NULL,
	"is_allowed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "allergens" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"icon_path" text DEFAULT '' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bar_menu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bar_menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"bar_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_text" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bar_menu_template_items" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_text" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bar_menu_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bar_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bars" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"highlights" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"open_time" time,
	"close_time" time,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"locale" text NOT NULL,
	"field" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_name" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"room_number" text DEFAULT '' NOT NULL,
	"stay_from" text DEFAULT '' NOT NULL,
	"stay_to" text DEFAULT '' NOT NULL,
	"trip_type" text DEFAULT '' NOT NULL,
	"overall_rating" integer NOT NULL,
	"cleanliness_rating" integer,
	"staff_rating" integer,
	"comfort_rating" integer,
	"value_rating" integer,
	"food_rating" integer,
	"nps_score" integer,
	"positive" text DEFAULT '' NOT NULL,
	"negative" text DEFAULT '' NOT NULL,
	"staff_response" text DEFAULT '' NOT NULL,
	"staff_action_note" text DEFAULT '' NOT NULL,
	"staff_response_by" text DEFAULT '' NOT NULL,
	"staff_response_at" timestamp,
	"consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_name" text DEFAULT '' NOT NULL,
	"room_number" text DEFAULT '' NOT NULL,
	"request_type" text DEFAULT 'support' NOT NULL,
	"issue_category" text DEFAULT 'other' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"staff_response" text DEFAULT '' NOT NULL,
	"staff_response_by" text DEFAULT '' NOT NULL,
	"staff_response_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kids_service_items" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"trigger" text NOT NULL,
	"content" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kids_services" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nearby_guide_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"distance" text NOT NULL,
	"eta" text NOT NULL,
	"note" text NOT NULL,
	"phone" text,
	"map_query" text NOT NULL,
	"tone" text NOT NULL,
	"section" text NOT NULL,
	"icon_key" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_code" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_code" text NOT NULL,
	"room_number" text NOT NULL,
	"surname" text NOT NULL,
	"guest_name" text NOT NULL,
	"room_type" text NOT NULL,
	"board_type" text NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"check_in" text NOT NULL,
	"check_out" text NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"floor" integer NOT NULL,
	"view" text DEFAULT '' NOT NULL,
	"bed_type" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_reservation_code_unique" UNIQUE("reservation_code")
);
--> statement-breakpoint
CREATE TABLE "room_service_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "kids_activities" ADD COLUMN "service_id" text;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "allergens" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_template_items" ADD COLUMN "allergens" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "room_service_items" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "room_service_orders" ADD COLUMN "cancellation_reason" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "room_service_orders" ADD COLUMN "cancelled_by" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_role_pages" ADD CONSTRAINT "admin_role_pages_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bar_menu_items" ADD CONSTRAINT "bar_menu_items_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bar_menu_template_items" ADD CONSTRAINT "bar_menu_template_items_template_id_bar_menu_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."bar_menu_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bar_menu_templates" ADD CONSTRAINT "bar_menu_templates_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_service_items" ADD CONSTRAINT "kids_service_items_service_id_kids_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."kids_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_role_pages_role_id_page_key_unique" ON "admin_role_pages" USING btree ("role_id","page_key");--> statement-breakpoint
CREATE UNIQUE INDEX "content_translations_unique" ON "content_translations" USING btree ("entity_type","entity_id","locale","field");--> statement-breakpoint
CREATE INDEX "content_translations_lookup_idx" ON "content_translations" USING btree ("entity_type","locale");--> statement-breakpoint
CREATE INDEX "push_subscriptions_reservation_code_idx" ON "push_subscriptions" USING btree ("reservation_code");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_activities" ADD CONSTRAINT "kids_activities_service_id_kids_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."kids_services"("id") ON DELETE cascade ON UPDATE no action;