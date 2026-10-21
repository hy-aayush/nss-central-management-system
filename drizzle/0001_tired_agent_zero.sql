CREATE TYPE "public"."access_status" AS ENUM('ACTIVE', 'SUSPENDED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."builder_kind" AS ENUM('GENERAL', 'POC', 'DOMAIN_LEAD');--> statement-breakpoint
CREATE TYPE "public"."tech_kind" AS ENUM('MEMBER', 'MENTOR');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('COORDINATOR', 'TECH_TEAM', 'BUILDER', 'PROJECT_REPRESENTATIVE');--> statement-breakpoint
CREATE TABLE "office_assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "office_assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roll_number" text NOT NULL,
	"role" "user_role" NOT NULL,
	"tech_kind" "tech_kind",
	"builder_kind" "builder_kind",
	"project_id" smallint,
	"pr_slot" smallint,
	"domain" "creative_domain",
	"access_status" "access_status" DEFAULT 'ACTIVE' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"granted_by" text NOT NULL,
	"ended_by" text,
	"end_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "office_assignments_pr_slot_check" CHECK ("office_assignments"."pr_slot" in (1, 2)),
	CONSTRAINT "office_assignments_end_reason_check" CHECK (char_length("office_assignments"."end_reason") <= 300),
	CONSTRAINT "oa_shape" CHECK ((
        ("office_assignments"."role" = 'PROJECT_REPRESENTATIVE'
          and "office_assignments"."project_id" is not null and "office_assignments"."pr_slot" is not null
          and "office_assignments"."tech_kind" is null and "office_assignments"."builder_kind" is null
          and "office_assignments"."domain" is null)
        or ("office_assignments"."role" = 'BUILDER'
          and "office_assignments"."builder_kind" is not null
          and "office_assignments"."project_id" is null and "office_assignments"."pr_slot" is null
          and "office_assignments"."tech_kind" is null
          and (("office_assignments"."builder_kind" = 'DOMAIN_LEAD') = ("office_assignments"."domain" is not null)))
        or ("office_assignments"."role" = 'TECH_TEAM'
          and "office_assignments"."tech_kind" is not null
          and "office_assignments"."project_id" is null and "office_assignments"."pr_slot" is null
          and "office_assignments"."builder_kind" is null and "office_assignments"."domain" is null)
        or ("office_assignments"."role" = 'COORDINATOR'
          and "office_assignments"."project_id" is null and "office_assignments"."pr_slot" is null
          and "office_assignments"."tech_kind" is null and "office_assignments"."builder_kind" is null
          and "office_assignments"."domain" is null)
      ))
);
--> statement-breakpoint
ALTER TABLE "office_assignments" ADD CONSTRAINT "office_assignments_roll_number_volunteers_roll_number_fk" FOREIGN KEY ("roll_number") REFERENCES "public"."volunteers"("roll_number") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_assignments" ADD CONSTRAINT "office_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_assignments" ADD CONSTRAINT "office_assignments_granted_by_volunteers_roll_number_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."volunteers"("roll_number") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_assignments" ADD CONSTRAINT "office_assignments_ended_by_volunteers_roll_number_fk" FOREIGN KEY ("ended_by") REFERENCES "public"."volunteers"("roll_number") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "oa_active_role_uq" ON "office_assignments" USING btree ("roll_number","role") WHERE "office_assignments"."ends_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "oa_pr_slot_uq" ON "office_assignments" USING btree ("project_id","pr_slot") WHERE "office_assignments"."ends_at" is null and "office_assignments"."role" = 'PROJECT_REPRESENTATIVE';--> statement-breakpoint
CREATE INDEX "oa_roll_active_idx" ON "office_assignments" USING btree ("roll_number") WHERE "office_assignments"."ends_at" is null;