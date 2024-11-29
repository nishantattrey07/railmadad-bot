CREATE TABLE IF NOT EXISTS "my_schema_new"."complaint" (
	"PNR" text,
	"uuid" text PRIMARY KEY NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL,
	"status" text NOT NULL,
	"department" text NOT NULL,
	"subtype" text NOT NULL,
	"oneLineAI" text NOT NULL,
	"originalQuery" text NOT NULL
);
