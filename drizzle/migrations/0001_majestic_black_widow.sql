ALTER TABLE "purchase_items" ALTER COLUMN "qty" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "qty" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "unit" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "unit" text NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_unit_check" CHECK ("purchase_items"."unit" IN ('ekor', 'kg'));--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_unit_check" CHECK ("sale_items"."unit" IN ('ekor', 'kg'));