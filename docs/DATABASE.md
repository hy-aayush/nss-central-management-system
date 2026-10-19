# Database Infrastructure (as built)

**Status:** Task 1 implemented — infrastructure only; awaiting review.
**Date:** 19 Oct 2026.
**Authority:** `docs/SRS.md` (Sections 2.2, 3.1 rule 13, 8, 9.4, 16.1, 19.1 and Appendix D).

> No application tables, enums, relations, RLS policies, roles, functions or seed
> records exist yet. The SRS Section 8 schema is a separate, reviewed task. This
> document therefore records only configuration that has been implemented and
> verified; it is not yet the "Section 8 as built" document.

---

## 1. Responsibilities

| Path | Responsibility |
|---|---|
| `src/db/client.ts` | Typed Drizzle + `postgres` (postgres-js) connection factory. Contains the Supavisor pool settings. Takes an explicit connection string so scripts/tests can use a staging or local URL. |
| `src/db/index.ts` | **Server-only** application entry point. Imports `server-only`, reads `DATABASE_URL` lazily and caches one Drizzle handle on `globalThis` for the lifetime of a serverless instance. Also exports `closeDatabase()` for scripts/tests. |
| `src/db/schema/index.ts` | Single Drizzle schema barrel. Intentionally exports no tables in Task 1. Future schema files must be re-exported here. |
| `drizzle.config.ts` | Drizzle Kit configuration. Points at the schema barrel and `drizzle/`; reads **`ADMIN_DATABASE_URL`**, never `DATABASE_URL`. |
| `drizzle/` | Committed generated SQL migrations. Currently contains only the baseline `drizzle/meta/_journal.json` (zero entries). |
| `.env.example` | Placeholder-only environment contract. |

Dependency direction remains `app → features/*/service → features/*/repo → db`.
Client Components must never import `src/db/index.ts`; the `server-only` import
turns such an import into a build error.

## 2. Verified connection settings

The application URL must be the Supabase **Supavisor transaction pooler** for
the least-privilege `app_user` role:

- Host: the Mumbai (`ap-south-1`) pooler host shown in the Supabase dashboard.
  The usual shape is `aws-0-ap-south-1.pooler.supabase.com`; copy the exact
  value rather than guessing.
- Port: **6543** (transaction mode).
- Username format: `app_user.<project-ref>`.
- TLS: `sslmode=require`.
- `prepare: false` — transaction pooling cannot pin prepared statements to a
  backend connection.
- `max: 1` — exactly one connection per serverless instance.
- `idle_timeout: 20` seconds and `connect_timeout: 10` seconds — release pooler
  slots quickly and fail a stalled connection instead of hanging a request.

These values are defined once in `src/db/client.ts` and must not be increased
without updating this document and the SRS.

Migrations and backups use a separate **session-mode** admin connection on
port **5432** (`ADMIN_DATABASE_URL`). The app runtime never receives that URL.

## 3. Environment variables

Names follow SRS Appendix D exactly. See `.env.example` for placeholders.

For local commands, copy the template to `.env`. Next.js and Drizzle Kit both
read `.env`; Drizzle Kit does **not** read `.env.local`. If the admin URL is only
in `.env.local`, export `ADMIN_DATABASE_URL` in the shell before running
`npm run db:migrate` or `npm run db:studio`.

| Variable | Visibility | Purpose |
|---|---|---|
| `DATABASE_URL` | Server only | Supavisor transaction-pooler URL for `app_user` (port 6543). |
| `ADMIN_DATABASE_URL` | CI/local migration tooling only; never Vercel | Session-mode admin URL for Drizzle migrations, seed and backups (port 5432). |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL, used only to start Google sign-in. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key, used only to start Google sign-in. The anon key is public by design. |
| `CRON_SECRET` | Server only | Bearer token for `/api/cron/*`. |
| `APP_ORIGIN` | Server only | Origin checks for Route Handlers. |
| `AGE_PUBLIC_KEY` | GitHub backup job | Public key for encrypted backups. |

There is **no** service-role key in this application (SRS 16.3). Never prefix
`DATABASE_URL`, `ADMIN_DATABASE_URL`, `CRON_SECRET` or any future secret with
`NEXT_PUBLIC_`.

Staging and production use separate Supabase projects and separate values.
Never point a local command at production unless that action has been explicitly
approved.

## 4. Drizzle Kit workflow

| Command | Connects to a database? | Purpose |
|---|---|---|
| `npm run db:schema` | No | Print the SQL diff for the current schema (empty in Task 1) without generating a migration. |
| `npm run db:generate` | No | Generate a new SQL migration from `src/db/schema/index.ts`. |
| `npm run db:check` | No | Validate the migration journal and generated SQL. |
| `npm run db:migrate` | Yes, `ADMIN_DATABASE_URL` | Apply committed migrations. |
| `npm run db:studio` | Yes, `ADMIN_DATABASE_URL` | Inspect the database. Binds to `127.0.0.1`; local/staging only. |

Recommended sequence when the schema task begins:

1. Add schema files under `src/db/schema/` and re-export them from
   `src/db/schema/index.ts`.
2. Run `npm run db:generate` and review the generated SQL in `drizzle/`.
3. Run `npm run db:check`.
4. Apply only to a scratch/staging database first with
   `ADMIN_DATABASE_URL` set.
5. Add the SRS Section 8.7 manual SQL under `drizzle/manual/` and apply it
   after the migrations with the admin role.
6. Record the verified result and any index/size measurements in this file.

There is intentionally no `db:push` script. `push` can apply destructive schema
changes without a reviewable migration; this project commits generated SQL and
runs it deliberately (SRS 19.1).

## 5. Validation performed on 19 Oct 2026

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed. |
| `npm run db:schema` | Passed; printed no SQL because the schema is intentionally empty. |
| `npm run db:generate` | Passed, loaded the schema barrel, reported `0 tables` and `No schema changes, nothing to migrate`; created the baseline `drizzle/meta/_journal.json`. |
| `npm run db:check` | Passed (`Everything's fine`). |
| `createDatabase()` with a placeholder URL via `tsx` | Created a typed Drizzle handle and postgres-js client without connecting; `client.end()` completed cleanly. |
| `npm run db:migrate` with no admin URL | Failed safely with `Please provide required params for Postgres driver: [x] url: ''`; no connection was attempted. |
| `npm run build` | Passed; no page imports the database module yet, so the build does not open a connection. |

**Not verified:** a live Supabase connection, role grants, RLS, migration
application, or query behaviour. No credentials were provided for this task and
no production or staging SQL was executed.

## 6. Known limitations / next steps

- The SRS Section 8 schema and its exact constraints/indexes are **not**
  implemented yet.
- `drizzle/manual/security.sql`, database roles, RLS, functions, `pg_cron`,
  seeds and the `SYSTEM` row are not implemented yet.
- `db:studio` uses the admin connection and is restricted to `127.0.0.1`.
  Do not expose it or run it against production.
- The generated migration journal has zero entries by design.
