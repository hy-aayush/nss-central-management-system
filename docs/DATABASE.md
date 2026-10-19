# Database Infrastructure and Foundational Schema (as built)

**Status:** Task 1 infrastructure and Task 2A foundational schema implemented.
No migration has been generated or applied; awaiting review.
**Date:** 19 Oct 2026.
**Authority:** `docs/SRS.md` (Sections 2.2, 3.1 rule 13, 8, 9.4, 16.1, 19.1 and Appendix D).

> The foundational schema group (`projects`, `volunteers`, `volunteer_domains`
> and their four enums) is implemented in Drizzle. Later SRS Section 8 groups,
> manual security SQL, roles/RLS, functions and seed records do **not** exist
> yet. This document records verified configuration and the foundational schema;
> it is not yet the complete "Section 8 as built" document.

---

## 1. Responsibilities

| Path | Responsibility |
|---|---|
| `src/db/client.ts` | Typed Drizzle + `postgres` (postgres-js) connection factory. Contains the Supavisor pool settings. Takes an explicit connection string so scripts/tests can use a staging or local URL. |
| `src/db/index.ts` | **Server-only** application entry point. Imports `server-only`, reads `DATABASE_URL` lazily and caches one Drizzle handle on `globalThis` for the lifetime of a serverless instance. Also exports `closeDatabase()` for scripts/tests. |
| `src/db/schema/enums.ts` | The four enums required by the foundational group: `gender`, `volunteer_status`, `blood_group`, `creative_domain`. |
| `src/db/schema/projects.ts` | SRS 8.2 `projects`. |
| `src/db/schema/volunteers.ts` | SRS 8.2 `volunteers`. |
| `src/db/schema/volunteer-domains.ts` | SRS 8.2 `volunteer_domains`. |
| `src/db/schema/index.ts` | Single Drizzle schema barrel. Every schema file must be re-exported here. |
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
| `npm run db:schema` | No | Print the SQL diff for the current schema without generating a migration. |
| `npm run db:generate` | No | Generate a new SQL migration from `src/db/schema/index.ts`. |
| `npm run db:check` | No | Validate the migration journal and generated SQL. |
| `npm run db:migrate` | Yes, `ADMIN_DATABASE_URL` | Apply committed migrations. |
| `npm run db:studio` | Yes, `ADMIN_DATABASE_URL` | Inspect the database. Binds to `127.0.0.1`; local/staging only. |

Recommended sequence when adding a schema group:

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

## 5. Foundational schema (Task 2A)

Only the first dependency group is implemented. The exact SRS order is being
followed; later tables are deliberately absent.

| Area | Implemented |
|---|---|
| Enums | `gender`, `volunteer_status`, `blood_group`, `creative_domain` — exact SQL names and value order from SRS 8.1. |
| `projects` | `smallint` fixed id, unique `slug`/`name`, `smallint[]` SDGs, text defaults, `last_activity_at` and `updated_at` as `timestamptz`. |
| `volunteers` | Text roll-number PK, required gender, optional personal fields, project FK, edit-budget counter, all SRS counters, self-referencing notes editor, seven checks and two indexes. |
| `volunteer_domains` | Composite `(roll_number, domain)` PK, `since` date, volunteer FK and domain index. |

Deliberately **not** stored: `email`, academic `year`, attendance rates,
project status and other derived values. Stored counters are present because
SRS 8.2 explicitly permits them and SRS 11.10 restricts who may change them.

The SRS writes its seven `volunteers` checks inline without constraint names.
PostgreSQL and Drizzle both need stable names, so the schema uses the
`volunteers_<field>_check` convention. The expressions and bounds are unchanged.

`join_date` and `volunteer_domains.since` use the SRS default `current_date`.
PostgreSQL evaluates that in the database session timezone, so services that
need an exact IST calendar day should pass the date explicitly rather than rely
on the default near midnight (D-021).

**Known migration-level gap:** SRS 8.2 specifies `WITH (fillfactor = 85)` on
`volunteers`. Drizzle 0.45's schema API cannot express table storage parameters,
so this must be added by reviewed custom SQL when the first migration is
generated. It is recorded in D-020 and is not silently omitted from the
migration review.

## 6. Validation history

### Task 1 — infrastructure (19 Oct 2026)

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
application, or query behaviour. No credentials were provided for Task 1 and
no production or staging SQL was executed.

### Task 2A — foundational schema (19 Oct 2026)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Passed. |
| `npm run db:schema` | Passed; printed the SQL for the four enums, three tables, seven checks, three indexes and three foreign keys. Compared field-by-field with SRS 8.1/8.2. |
| `getTableConfig` metadata inspection | Confirmed column names/types/nullability/defaults, check/index names, FKs and delete actions, composite PK and enum values. |
| Temporary inferred-type assertion file | Passed for select/insert nullability, enum unions, required and defaulted fields; file removed after validation. |
| `npm run lint` | Passed. |
| `npm run db:check` | Passed. |
| `npm run build` | Passed; existing application pages still build. |

**Not verified:** no migration was generated or applied, and no live database
was contacted. `fillfactor` remains pending the migration review.

## 7. Known limitations / next steps

- Only the foundational schema group is implemented. `office_assignments`,
  `red_flags`, `approval_requests`, `import_batches`, events, meetings, hours,
  audit and system tables are still pending.
- No migration SQL exists yet; `drizzle/meta/_journal.json` still has zero
  entries. The `volunteers` `fillfactor = 85` storage parameter must be added by
  reviewed custom SQL when migrations are generated.
- `drizzle/manual/security.sql`, database roles, RLS, functions, `pg_cron`,
  seeds and the `SYSTEM` row are not implemented yet.
- `db:studio` uses the admin connection and is restricted to `127.0.0.1`.
  Do not expose it or run it against production.
