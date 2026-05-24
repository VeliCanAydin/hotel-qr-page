ALTER TABLE "menu_items" ALTER COLUMN "allergens" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "menu_items" ALTER COLUMN "allergens" TYPE jsonb USING CASE WHEN "allergens" IS NULL OR "allergens" = '' THEN '[]'::jsonb ELSE "allergens"::jsonb END;
--> statement-breakpoint
ALTER TABLE "menu_items" ALTER COLUMN "allergens" SET DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "menu_items" ALTER COLUMN "allergens" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "menu_template_items" ALTER COLUMN "allergens" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "menu_template_items" ALTER COLUMN "allergens" TYPE jsonb USING CASE WHEN "allergens" IS NULL OR "allergens" = '' THEN '[]'::jsonb ELSE "allergens"::jsonb END;
--> statement-breakpoint
ALTER TABLE "menu_template_items" ALTER COLUMN "allergens" SET DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "menu_template_items" ALTER COLUMN "allergens" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "room_service_items" ALTER COLUMN "allergens" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "room_service_items" ALTER COLUMN "allergens" TYPE jsonb USING CASE WHEN "allergens" IS NULL OR "allergens" = '' THEN '[]'::jsonb ELSE "allergens"::jsonb END;
--> statement-breakpoint
ALTER TABLE "room_service_items" ALTER COLUMN "allergens" SET DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "room_service_items" ALTER COLUMN "allergens" SET NOT NULL;
