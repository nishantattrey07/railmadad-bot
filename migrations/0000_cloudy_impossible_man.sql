CREATE SCHEMA "my_schema_new";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "my_schema_new"."pnr" (
	"PNR" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"isdisable" boolean DEFAULT false NOT NULL,
	"jDate" date NOT NULL,
	"passengerName" text NOT NULL,
	"trainNumber" text NOT NULL,
	"coach" text NOT NULL,
	"seat" text NOT NULL,
	"departureStation" text NOT NULL,
	"departureDate" date NOT NULL,
	"arrivalStation" text NOT NULL,
	"arrivalDate" date NOT NULL,
	"bookingStatus" text NOT NULL,
	"bookingDate" date NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL
);
