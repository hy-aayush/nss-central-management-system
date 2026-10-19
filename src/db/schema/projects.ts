import { pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";

/**
 * SRS Section 8.2 — `projects`.
 *
 * Nine fixed rows seeded later (Appendix A.1). This is deliberately NOT an
 * identity column: project ids 1–9 are stable business identifiers used by
 * volunteers, events, meetings and office assignments.
 *
 * No CHECK constraints or extra indexes are defined here because the SRS DDL
 * specifies none for this table. In particular:
 * - `slug` and `name` are unique (implemented as unique constraints).
 * - `sdgs` is a `smallint[]`; cardinality/range validation is left to the
 *   service/Zod layer because the SRS DDL does not constrain it.
 * - `accent_color` is stored as text, not a Postgres colour type.
 */
export const projects = pgTable("projects", {
  /** Fixed project id, 1–9 (Appendix A.1). */
  id: smallint("id").primaryKey(),

  /** URL-safe identifier, unique (for example `bandhutva`). */
  slug: text("slug").notNull().unique(),

  /** Display name, unique (for example `Bandhutva`). */
  name: text("name").notNull().unique(),

  /** UN Sustainable Development Goal numbers, for example `[4, 17]`. */
  sdgs: smallint("sdgs").array().notNull(),

  /** Short project tagline; empty until the NSS team supplies one. */
  tagline: text("tagline").notNull().default(""),

  /** Longer description; empty until the NSS team supplies one. */
  description: text("description").notNull().default(""),

  /** UI accent colour, for example `#64748b`. */
  accentColor: text("accent_color").notNull().default("#64748b"),

  /**
   * Set by the service when a finalised, non-imported event or meeting of this
   * project happens (SRS 11.11). Project "status" is derived from this value
   * on read and is never stored.
   */
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),

  /** Application-managed timestamp; there is no database trigger. */
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
