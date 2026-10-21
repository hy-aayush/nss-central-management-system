import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  accessStatusEnum,
  builderKindEnum,
  creativeDomainEnum,
  techKindEnum,
  userRoleEnum,
} from "./enums";
import { projects } from "./projects";
import { volunteers } from "./volunteers";

/**
 * SRS Section 8.2 — `office_assignments`.
 *
 * This table is both the office roster and the role history. Rows are never
 * deleted by the application: ending a post sets `ends_at`, `ended_by` and a
 * reason. Access is valid only while `ends_at is null` and
 * `access_status = 'ACTIVE'` (SRS 4.4).
 *
 * The SRS puts the whole shape in one `check` constraint (`oa_shape`) so a
 * malformed post is impossible at the database level:
 * - COORDINATOR: no project, slot, tech kind, builder kind or domain.
 * - TECH_TEAM: a `tech_kind`, nothing else.
 * - PROJECT_REPRESENTATIVE: project and PR slot, nothing else.
 * - BUILDER: a `builder_kind`; a DOMAIN_LEAD must name a domain, the other
 *   builder kinds must not.
 *
 * `granted_by`/`ended_by` are volunteers, never auth user ids, because the
 * roster is part of the office record (SRS 8.2 and 8.8).
 */
export const officeAssignments = pgTable(
  "office_assignments",
  {
    /** Internal identifier; the roster's business key is (roll, role, dates). */
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    /** The person holding the post. Access is checked against this roll number. */
    rollNumber: text("roll_number")
      .notNull()
      .references(() => volunteers.rollNumber, { onDelete: "restrict" }),

    /** One of the four office roles. */
    role: userRoleEnum("role").notNull(),

    /** Only for TECH_TEAM (MEMBER or MENTOR). */
    techKind: techKindEnum("tech_kind"),

    /** Only for BUILDER (GENERAL, POC or DOMAIN_LEAD). */
    builderKind: builderKindEnum("builder_kind"),

    /** Only for PROJECT_REPRESENTATIVE. Projects are never deleted (8.8). */
    projectId: smallint("project_id").references(() => projects.id, {
      onDelete: "restrict",
    }),

    /** Only for PROJECT_REPRESENTATIVE; one of the two slots per project. */
    prSlot: smallint("pr_slot"),

    /** Only for a DOMAIN_LEAD builder. */
    domain: creativeDomainEnum("domain"),

    /** ACTIVE by default. SUSPENDED pauses access without ending the post. */
    accessStatus: accessStatusEnum("access_status")
      .notNull()
      .default("ACTIVE"),

    /** When the post began (application-managed). */
    startsAt: timestamp("starts_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** NULL while the post is active; set when it is ended (never deleted). */
    endsAt: timestamp("ends_at", { withTimezone: true }),

    /** The person who granted the post (self for the first bootstrap rows). */
    grantedBy: text("granted_by")
      .notNull()
      .references(() => volunteers.rollNumber, { onDelete: "restrict" }),

    /** Who ended the post. */
    endedBy: text("ended_by").references(() => volunteers.rollNumber, {
      onDelete: "restrict",
    }),

    /** Required in practice when a post is ended; capped by the SRS. */
    endReason: text("end_reason"),

    /** Application-managed timestamp; there is no database trigger. */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // SRS 8.2 inline check. Drizzle needs a name; this matches PostgreSQL's
    // default name for the unnamed `check (pr_slot in (1,2))`.
    check(
      "office_assignments_pr_slot_check",
      sql`${t.prSlot} in (1, 2)`,
    ),
    check(
      "office_assignments_end_reason_check",
      sql`char_length(${t.endReason}) <= 300`,
    ),

    /** SRS 8.2 `oa_shape`: one role's fields exactly, nothing extra. */
    check(
      "oa_shape",
      sql`(
        (${t.role} = 'PROJECT_REPRESENTATIVE'
          and ${t.projectId} is not null and ${t.prSlot} is not null
          and ${t.techKind} is null and ${t.builderKind} is null
          and ${t.domain} is null)
        or (${t.role} = 'BUILDER'
          and ${t.builderKind} is not null
          and ${t.projectId} is null and ${t.prSlot} is null
          and ${t.techKind} is null
          and ((${t.builderKind} = 'DOMAIN_LEAD') = (${t.domain} is not null)))
        or (${t.role} = 'TECH_TEAM'
          and ${t.techKind} is not null
          and ${t.projectId} is null and ${t.prSlot} is null
          and ${t.builderKind} is null and ${t.domain} is null)
        or (${t.role} = 'COORDINATOR'
          and ${t.projectId} is null and ${t.prSlot} is null
          and ${t.techKind} is null and ${t.builderKind} is null
          and ${t.domain} is null)
      )`,
    ),

    // SRS 8.2: one active row per person per role.
    uniqueIndex("oa_active_role_uq")
      .on(t.rollNumber, t.role)
      .where(sql`${t.endsAt} is null`),

    // SRS 8.2: exactly two PR slots per project while the rows are active.
    uniqueIndex("oa_pr_slot_uq")
      .on(t.projectId, t.prSlot)
      .where(
        sql`${t.endsAt} is null and ${t.role} = 'PROJECT_REPRESENTATIVE'`,
      ),

    // SRS 8.2: the access gate's lookup.
    index("oa_roll_active_idx")
      .on(t.rollNumber)
      .where(sql`${t.endsAt} is null`),
  ],
);
