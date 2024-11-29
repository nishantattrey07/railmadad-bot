ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."pnr" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."pnr" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ADD COLUMN "feedback" text;--> statement-breakpoint
ALTER TABLE "my_schema_new"."complaint" ADD COLUMN "stars" integer;