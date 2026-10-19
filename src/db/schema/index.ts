/**
 * Drizzle schema entry point.
 *
 * Task 1 intentionally stops at the database infrastructure. No application
 * tables, enums or relations are defined yet; the SRS Section 8 schema is a
 * separate, reviewed task.
 *
 * When the schema is added:
 * - Put one domain group per file under `src/db/schema/` (for example
 *   `enums.ts`, `projects.ts`, `volunteers.ts`).
 * - Re-export every table, enum and relation from this file. Both
 *   `drizzle.config.ts` and the typed connection module load this one barrel,
 *   so a file that is not exported here is invisible to Drizzle Kit and to the
 *   application.
 * - Keep this file free of side effects and environment access. It is loaded
 *   by `drizzle-kit` outside the Next.js server runtime.
 *
 * Schema files are not secrets and may be imported for type-only use, but
 * application code should get its handle from `src/db/index.ts`, which is
 * marked `server-only`.
 */

export {};
