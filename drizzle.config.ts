import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 * Commands:
 * - `npm run db:generate` — diff `src/db/schema/index.ts` against the committed
 *   migrations in `drizzle/` and write new SQL. This does not connect to a
 *   database, so it works without any secret.
 * - `npm run db:check` — validate the migration journal and SQL files. Also
 *   does not connect.
 * - `npm run db:migrate` — apply committed migrations. This requires
 *   `ADMIN_DATABASE_URL`; the app user must never run DDL.
 * - `npm run db:studio` — inspect the database. It uses the same admin
 *   connection, so run it locally against staging only.
 *
 * `DATABASE_URL` is deliberately not read here. The app's runtime role
 * (`app_user`) is not allowed to create or alter tables; migrations use the
 * admin/session-mode connection from SRS Section 19.1. Keeping one variable
 * for Drizzle Kit prevents a migration from accidentally running as the app
 * user.
 */
const adminDatabaseUrl = process.env.ADMIN_DATABASE_URL?.trim();

export default defineConfig({
  // Postgres on Supabase.
  dialect: "postgresql",

  // One barrel file is the source of truth for Drizzle Kit and the app.
  schema: "./src/db/schema/index.ts",

  // Generated SQL migrations are committed to the repository.
  out: "./drizzle",

  // The SRS requires snake_case database identifiers and camelCase TypeScript
  // properties. The runtime `drizzle()` call uses the same casing.
  casing: "snake_case",

  // Ask before destructive operations such as `push`/`up` against a real DB.
  strict: true,

  // Print the SQL Drizzle Kit would run. Helpful during review; contains no
  // credentials.
  verbose: true,

  dbCredentials: {
    // Empty until a developer/CI supplies the admin URL. `generate` and `check`
    // do not connect, so they still run on a clean checkout. `migrate` fails
    // clearly at connect time when the variable is missing.
    url: adminDatabaseUrl ?? "",
  },
});
