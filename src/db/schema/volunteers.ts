import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { bloodGroupEnum, genderEnum, volunteerStatusEnum } from "./enums";
import { projects } from "./projects";

/**
 * SRS Section 8.2 — `volunteers`.
 *
 * One row per person. The roll number is the natural primary key used by every
 * other table, so it is a string, not a generated identity.
 *
 * Deliberately NOT stored here (SRS 3.1 rule 8 and 8.2):
 * - `email`: always `${roll_number}@${EMAIL_DOMAIN}`, derived by the mapper.
 * - `year`: computed from `batch_year` using `academicYearStart(now)` in IST.
 * - derived rates, project status and attendance percentages.
 *
 * The stored counters below are the only derived values the SRS explicitly
 * permits. They may change only inside the functions named in SRS 11.10
 * (`finalizeEvent`, `finalizeMeeting`, `correctAttendance`, red-flag
 * add/revoke, `recomputeHours`, history import, `rebuildCounters`).
 *
 * SRS 8.2 also specifies `WITH (fillfactor = 85)` on this table. Drizzle
 * 0.45's schema API cannot express PostgreSQL storage parameters, so that must
 * be added by the reviewed custom SQL/migration step before applying the
 * first real migration.
 */
export const volunteers = pgTable(
  "volunteers",
  {
    /**
     * Primary key and the person's identity everywhere else.
     *
     * The database check is deliberately loose (letters/digits, 4–20 chars).
     * The authoritative pattern is `ROLL_NUMBER_PATTERN` in
     * `src/config/identity.ts`; tightening it there must not require a
     * migration (SRS 8.2 and Appendix C).
     */
    rollNumber: text("roll_number").primaryKey(),

    /** Display name, 2–100 characters. */
    name: text("name").notNull(),

    /** Compulsory (SRS D-17); FULL visibility only. */
    gender: genderEnum("gender").notNull(),

    /** Optional Indian mobile number, 10 digits starting 6–9. */
    phone: text("phone"),

    /** Optional hostel name, max 60 characters. */
    hostel: text("hostel"),

    /** Optional; one of the eight values in the `blood_group` enum. */
    bloodGroup: bloodGroupEnum("blood_group"),

    /** Optional free-text place, for example `Ranchi, Jharkhand`. */
    cityState: text("city_state"),

    /** Admission year, for example 2024. Used to compute the academic year. */
    batchYear: smallint("batch_year").notNull(),

    /** ACTIVE by default; archived volunteers are hidden from default lists. */
    status: volunteerStatusEnum("status").notNull().default("ACTIVE"),

    /**
     * Nullable because office staff may not belong to a project. A missing
     * project for a regular volunteer is a data-quality issue, not a DB error.
     * `restrict` matches SRS 8.8: projects are never deleted.
     */
    projectId: smallint("project_id").references(() => projects.id, {
      onDelete: "restrict",
    }),

    /**
     * IST calendar day of joining. The SRS specifies `DEFAULT current_date`.
     * PostgreSQL evaluates that in the database session timezone, so a caller
     * that needs an exact IST day should pass `joinDate` explicitly instead of
     * relying on the default around midnight.
     */
    joinDate: date("join_date").notNull().default(sql`current_date`),

    /** Optional private notes, max 1,000 characters. FULL visibility only. */
    notes: text("notes"),

    /**
     * Last editor of the notes. Self-reference, so it needs an explicit
     * `AnyPgColumn` return type to avoid a circular TypeScript initializer.
     * `restrict` matches SRS 8.8; permanent deletion is handled by the
     * `delete_volunteer_permanently()` database function.
     */
    notesUpdatedBy: text("notes_updated_by").references(
      (): AnyPgColumn => volunteers.rollNumber,
      { onDelete: "restrict" },
    ),

    /** When the notes were last edited; history lives in the audit log. */
    notesUpdatedAt: timestamp("notes_updated_at", { withTimezone: true }),

    /** Edit budget counter for PR notes edits (SRS 11.2). */
    notesEditCount: smallint("notes_edit_count").notNull().default(0),

    // -----------------------------------------------------------------------
    // Cached counters. Only the SRS 11.10 functions may write these.
    // -----------------------------------------------------------------------

    /** PRESENT in any event, regardless of source. */
    eventsAttended: integer("events_attended").notNull().default(0),

    /** FCFS rows finalised as PRESENT or ABSENT (EXCUSED excluded). */
    eventsFcfsFinal: integer("events_fcfs_final").notNull().default(0),

    /** FCFS rows finalised as PRESENT. */
    eventsFcfsPresent: integer("events_fcfs_present").notNull().default(0),

    /** FCFS rows finalised as ABSENT; the "penalty" count. */
    eventsMissedFcfs: integer("events_missed_fcfs").notNull().default(0),

    /** Meetings where the volunteer was PRESENT. */
    meetingsPresent: integer("meetings_present").notNull().default(0),

    /** Meetings where the volunteer was counted ABSENT. */
    meetingsAbsent: integer("meetings_absent").notNull().default(0),

    /**
     * Sum of event + adjustment + legacy hours across all academic years.
     * `numeric(7,1)` is exposed as a JS number; all values are far inside the
     * safe integer range at this system's scale.
     */
    allocatedHours: numeric("allocated_hours", {
      precision: 7,
      scale: 1,
      mode: "number",
    })
      .notNull()
      .default(0),

    /** Count of non-revoked red flags. */
    redFlagCount: smallint("red_flag_count").notNull().default(0),

    /** Application-managed timestamps; there are no database triggers. */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // SRS 8.2 checks. PostgreSQL passes a CHECK when its expression is NULL,
    // so the nullable phone/hostel/city/notes checks correctly allow NULL.
    check(
      "volunteers_roll_number_check",
      sql`${t.rollNumber} ~ '^[A-Za-z0-9]{4,20}$'`,
    ),
    check(
      "volunteers_name_check",
      sql`char_length(${t.name}) between 2 and 100`,
    ),
    check("volunteers_phone_check", sql`${t.phone} ~ '^[6-9][0-9]{9}$'`),
    check("volunteers_hostel_check", sql`char_length(${t.hostel}) <= 60`),
    check(
      "volunteers_city_state_check",
      sql`char_length(${t.cityState}) <= 60`,
    ),
    check(
      "volunteers_batch_year_check",
      sql`${t.batchYear} between 2000 and 2100`,
    ),
    check("volunteers_notes_check", sql`char_length(${t.notes}) <= 1000`),

    // SRS 8.2 indexes. Do not add "just in case" indexes (SRS 8.9).
    index("volunteers_project_status_idx").on(t.projectId, t.status),
    index("volunteers_status_idx").on(t.status),
  ],
);
