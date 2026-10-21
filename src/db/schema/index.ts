/**
 * Drizzle schema entry point.
 *
 * Both `drizzle.config.ts` and the typed connection module load this barrel, so
 * a table that is not re-exported here is invisible to Drizzle Kit and to the
 * application.
 *
 * File boundaries:
 * - `enums.ts`              PostgreSQL enums required by the current groups.
 * - `projects.ts`           SRS 8.2 `projects`.
 * - `volunteers.ts`         SRS 8.2 `volunteers`.
 * - `volunteer-domains.ts`  SRS 8.2 `volunteer_domains`.
 * - `office-assignments.ts` SRS 8.2 `office_assignments` (roster + role history).
 *
 * Later schema groups (events, meetings, hours, audit, system tables) must be
 * added as separate files and re-exported here. Do not define a second
 * independent schema entry point.
 *
 * Keep this file free of side effects and environment access. It is loaded by
 * `drizzle-kit` outside the Next.js server runtime.
 *
 * Schema files contain no credentials and may be imported for type-only use.
 * Application code must get its database handle from `src/db/index.ts`, which
 * is marked `server-only`.
 */

export * from "./enums";
export * from "./projects";
export * from "./volunteers";
export * from "./volunteer-domains";
export * from "./office-assignments";
