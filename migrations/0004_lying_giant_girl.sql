ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "PNR" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "updated_at" SET NOT NULL;