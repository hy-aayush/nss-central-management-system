CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "public"."creative_domain" AS ENUM('PHOTOGRAPHY', 'VIDEO_EDITING', 'GRAPHIC_DESIGNING', 'CONTENT_WRITING');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."volunteer_status" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" smallint PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sdgs" smallint[] NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"accent_color" text DEFAULT '#64748b' NOT NULL,
	"last_activity_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"roll_number" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"phone" text,
	"hostel" text,
	"blood_group" "blood_group",
	"city_state" text,
	"batch_year" smallint NOT NULL,
	"status" "volunteer_status" DEFAULT 'ACTIVE' NOT NULL,
	"project_id" smallint,
	"join_date" date DEFAULT current_date NOT NULL,
	"notes" text,
	"notes_updated_by" text,
	"notes_updated_at" timestamp with time zone,
	"notes_edit_count" smallint DEFAULT 0 NOT NULL,
	"events_attended" integer DEFAULT 0 NOT NULL,
	"events_fcfs_final" integer DEFAULT 0 NOT NULL,
	"events_fcfs_present" integer DEFAULT 0 NOT NULL,
	"events_missed_fcfs" integer DEFAULT 0 NOT NULL,
	"meetings_present" integer DEFAULT 0 NOT NULL,
	"meetings_absent" integer DEFAULT 0 NOT NULL,
	"allocated_hours" numeric(7, 1) DEFAULT 0 NOT NULL,
	"red_flag_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteers_roll_number_check" CHECK ("volunteers"."roll_number" ~ '^[A-Za-z0-9]{4,20}$'),
	CONSTRAINT "volunteers_name_check" CHECK (char_length("volunteers"."name") between 2 and 100),
	CONSTRAINT "volunteers_phone_check" CHECK ("volunteers"."phone" ~ '^[6-9][0-9]{9}$'),
	CONSTRAINT "volunteers_hostel_check" CHECK (char_length("volunteers"."hostel") <= 60),
	CONSTRAINT "volunteers_city_state_check" CHECK (char_length("volunteers"."city_state") <= 60),
	CONSTRAINT "volunteers_batch_year_check" CHECK ("volunteers"."batch_year" between 2000 and 2100),
	CONSTRAINT "volunteers_notes_check" CHECK (char_length("volunteers"."notes") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "volunteer_domains" (
	"roll_number" text NOT NULL,
	"domain" "creative_domain" NOT NULL,
	"since" date DEFAULT current_date NOT NULL,
	CONSTRAINT "volunteer_domains_pkey" PRIMARY KEY("roll_number","domain")
);
--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_notes_updated_by_volunteers_roll_number_fk" FOREIGN KEY ("notes_updated_by") REFERENCES "public"."volunteers"("roll_number") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_domains" ADD CONSTRAINT "volunteer_domains_roll_number_volunteers_roll_number_fk" FOREIGN KEY ("roll_number") REFERENCES "public"."volunteers"("roll_number") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- SRS 8.2 requires spare room in each volunteers page because the cached
-- counters are updated often. Drizzle 0.45 cannot express storage parameters
-- in the schema, so this reviewed migration-level statement fills that gap.
ALTER TABLE "public"."volunteers" SET (fillfactor = 85);--> statement-breakpoint
CREATE INDEX "volunteers_project_status_idx" ON "volunteers" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "volunteers_status_idx" ON "volunteers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_domains_domain_idx" ON "volunteer_domains" USING btree ("domain");