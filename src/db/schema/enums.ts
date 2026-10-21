import { pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL enums for the implemented schema groups.
 *
 * SRS Section 8.1 defines every enum. The enums used by `volunteers`,
 * `volunteer_domains` and `office_assignments` are defined here:
 *
 * - `gender`            -> volunteers.gender
 * - `volunteer_status`  -> volunteers.status
 * - `blood_group`       -> volunteers.blood_group
 * - `creative_domain`   -> volunteer_domains.domain, office_assignments.domain
 * - `user_role`         -> office_assignments.role
 * - `tech_kind`         -> office_assignments.tech_kind
 * - `builder_kind`      -> office_assignments.builder_kind
 * - `access_status`     -> office_assignments.access_status
 *
 * The first argument to `pgEnum` is the exact PostgreSQL type name. Do not
 * rename it: migrations and raw SQL depend on the SQL name, not the TypeScript
 * export name. Values are also in the exact SRS order.
 *
 * Later schema groups add the remaining SRS enums (event_type,
 * participation_mode, event_status, ...) with their tables.
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

/** SRS 8.1 and 8.2: the post a person holds (roster row). */
export const userRoleEnum = pgEnum("user_role", [
  "COORDINATOR",
  "TECH_TEAM",
  "BUILDER",
  "PROJECT_REPRESENTATIVE",
]);

/** SRS 8.1: only meaningful for `role = 'TECH_TEAM'`. */
export const techKindEnum = pgEnum("tech_kind", ["MEMBER", "MENTOR"]);

/** SRS 8.1: only meaningful for `role = 'BUILDER'`. */
export const builderKindEnum = pgEnum("builder_kind", [
  "GENERAL",
  "POC",
  "DOMAIN_LEAD",
]);

/**
 * SRS 8.1: access on a post. Access is valid only while `ends_at is null` and
 * `access_status = 'ACTIVE'` (SRS 4.4).
 */
export const accessStatusEnum = pgEnum("access_status", [
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
]);
