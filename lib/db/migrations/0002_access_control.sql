CREATE TABLE "admin_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "admin_role_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"page_key" text NOT NULL,
	"is_allowed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_role_pages_role_id_page_key_unique" UNIQUE("role_id","page_key")
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role_id" integer;
--> statement-breakpoint
ALTER TABLE "admin_role_pages" ADD CONSTRAINT "admin_role_pages_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE set null ON UPDATE no action;