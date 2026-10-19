import { pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL enums required by the foundational schema group.
 *
 * SRS Section 8.1 defines every enum. Only the four enums used by `volunteers`
 * and `volunteer_domains` are defined here:
 *
 * - `gender`          -> volunteers.gender
 * - `volunteer_status` -> volunteers.status
 * - `blood_group`     -> volunteers.blood_group
 * - `creative_domain` -> volunteer_domains.domain
 *
 * The first argument to `pgEnum` is the exact PostgreSQL type name. Do not
 * rename it: migrations and raw SQL depend on the SQL name, not the TypeScript
 * export name. Values are also in the exact SRS order.
 *
 * Other SRS enums (user_role, tech_kind, builder_kind, access_status,
 * event_type, ...) belong to later schema groups and must be added when their
 * tables are implemented.
 */

/** SRS 8.1: `gender` — compulsory on every volunteer. */
export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

/** SRS 8.1: `volunteer_status` — lifecycle is ACTIVE ⇄ SUSPENDED → ARCHIVED. */
export const volunteerStatusEnum = pgEnum("volunteer_status", [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
]);

/** SRS 8.1: `blood_group` — optional, FULL-visibility field. */
export const bloodGroupEnum = pgEnum("blood_group", [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

/**
 * SRS 8.1: `creative_domain` — only the four specialisations are stored.
 * "General Volunteering" is implicit in the application types and is not a DB
 * enum value (SRS 8.1 and Section 10.2).
 */
export const creativeDomainEnum = pgEnum("creative_domain", [
  "PHOTOGRAPHY",
  "VIDEO_EDITING",
  "GRAPHIC_DESIGNING",
  "CONTENT_WRITING",
]);
