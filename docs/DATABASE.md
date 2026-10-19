# Database Infrastructure, Foundational Schema and Initial Migration (as built)

**Status:** Task 1 infrastructure, Task 2A foundational schema and Task 3 initial
migration/manual security SQL are implemented. The migration was applied only
to a disposable local PostgreSQL 17.11 database. No staging or production
database was contacted.
**Date:** 19 Oct 2026.
**Authority:** `docs/SRS.md` (Sections 2.2, 3.1 rules 13 and 26, 8, 9.4, 16.1,
19.1 and Appendix D).

> Only the foundational schema group (`projects`, `volunteers`,
> `volunteer_domains` and their four enums) exists. The SRS 8.7 audit-purge,
> permanent-delete, counter and retention functions, `pg_cron`, later schema
> groups and seed records do **not** exist yet. `drizzle/manual/security.sql`
> is intentionally limited to the SQL that is valid for this schema.

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
| `drizzle/0000_moaning_ricochet.sql` | First migration file: four enums, three tables, seven checks, three indexes, three foreign keys, two unique constraints and the reviewed `volunteers` fillfactor statement. |
| `drizzle/meta/` | Drizzle journal and snapshot for this migration. |
| `drizzle/manual/security.sql` | SRS 8.7 role, grants, audit restrictions, RLS, timeouts and `SYSTEM` row. Repeatable. |
| `drizzle/manual/README.md` | Manual-SQL order, local role prerequisites and deferred SRS blocks. |
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
`npm run db:migrate`, `npm run db:studio` or the manual SQL.

| Variable | Visibility | Purpose |
|---|---|---|
| `DATABASE_URL` | Server only | Supavisor transaction-pooler URL for `app_user` (port 6543). |
| `ADMIN_DATABASE_URL` | CI/local migration tooling only; never Vercel | Session-mode admin URL for Drizzle migrations, manual SQL, seed and backups (port 5432). |
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

The `app_user` password is never committed. `security.sql` creates the login
role without a password; set it from the secret store or Supabase dashboard
with `alter role app_user password '<from secret store>';`.

## 4. Drizzle Kit and manual SQL workflow

| Command | Connects to a database? | Purpose |
|---|---|---|
| `npm run db:schema` | No | Print the SQL diff for the current schema without generating a migration. |
| `npm run db:generate` | No | Generate a new SQL migration from `src/db/schema/index.ts`. |
| `npm run db:check` | No | Validate the migration journal and generated SQL. |
| `npm run db:migrate` | Yes, `ADMIN_DATABASE_URL` | Apply migration files. |
| `npm run db:studio` | Yes, `ADMIN_DATABASE_URL` | Inspect the database. Binds to `127.0.0.1`; local/staging only. |

Apply order:

1. Add schema files under `src/db/schema/` and re-export them from
   `src/db/schema/index.ts`.
2. Run `npm run db:generate` and review the generated SQL in `drizzle/`.
3. Run `npm run db:check`.
4. Apply only to a scratch/staging database first with
   `ADMIN_DATABASE_URL` set.
5. Apply the manual SQL with the admin connection:
   `psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/manual/security.sql`.
6. Re-run `security.sql` after adding a table so the RLS loop and default
   privileges cover it.
7. Record the verified result and any index/size measurements in this file.

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

## 6. Initial migration and manual security SQL (Task 3)

### 6.1 Migration

| Property | Value |
|---|---|
| Migration | `drizzle/0000_moaning_ricochet.sql` |
| Journal index | `0` |
| Created by | `drizzle-kit@0.31.11` |
| Tables | `projects`, `volunteers`, `volunteer_domains` |
| Enums | `blood_group`, `creative_domain`, `gender`, `volunteer_status` |
| Table order | `projects` → `volunteers` (project FK) → `volunteer_domains` (volunteer FK) |
| Constraints | 3 primary keys, 2 unique constraints, 7 checks, 3 foreign keys with `ON DELETE RESTRICT` |
| Indexes | 2 on `volunteers`, 1 on `volunteer_domains` |

The generated SQL matched SRS 8.1/8.2. One reviewed migration-level statement
was added:

```sql
ALTER TABLE "public"."volunteers" SET (fillfactor = 85);
```

Drizzle 0.45 cannot express table storage parameters in the TypeScript schema.
The statement is placed after `CREATE TABLE volunteers` and before the indexes.
It is the only manual edit to the generated file. `db:generate` reports no
further schema changes, so the snapshot and journal are consistent with the
Drizzle schema.

### 6.2 Manual SQL that is implemented

`drizzle/manual/security.sql` implements the SRS 8.7 parts that are valid for
the current schema:

- Creates `app_user` with `LOGIN` only when missing and enforces
  `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE` and `NOBYPASSRLS`.
- Revokes `CREATE` on schema `public` and grants schema usage, table DML and
  sequence usage/select to `app_user`.
- Sets default privileges for future tables/sequences created by the same admin
  role.
- Revokes all privileges from `anon` and `authenticated`.
- Enables RLS on every `public` table and creates the `app_all` policy for
  `app_user` (except `audit_log`, which gets select/insert policies).
- Sets the three SRS role timeouts.
- Inserts the `SYSTEM` row with `ON CONFLICT DO NOTHING`.

The audit rules are guarded by `to_regclass('public.audit_log')`. They are a
no-op until the audit table exists; when it exists, the same file revokes
`UPDATE`, `DELETE` and `TRUNCATE` from `app_user` and creates the read/insert
policies. This was verified against a temporary local `audit_log` table and then
the table was removed.

### 6.3 Manual SQL deliberately deferred

These SRS 8.7 blocks are **not** in the repository yet because their
dependencies do not exist:

| Deferred block | Missing dependencies | Reason |
|---|---|---|
| `purge_audit_log()` and the `audit-purge` `pg_cron` schedule | `audit_log`, `settings`, `pg_cron` | Creating a function that references missing tables would fail when called; scheduling it now would be a broken job. |
| `delete_volunteer_permanently(text)` | `office_assignments`, `event_participants`, `meeting_attendance`, `attendance_corrections`, `hours_adjustments`, `volunteer_year_hours`, `red_flags`, `emergency_grants`, `events`, `event_groups`, `event_projects`, `meetings`, `settings`, `approval_requests` | SRS 8.7 and rule 26 require it to handle every FK pointing at `volunteers`. A partial function would break or orphan data when those tables arrive. |
| Counter maintenance functions | `events`, `event_participants`, `meetings`, `meeting_attendance`, `red_flags`, `volunteer_year_hours` | SRS 11.10 specifies TypeScript feature functions, not database functions or triggers. Stored counters are already present; no generic DB counter function is authorized. |
| Retention operations | Later tables, daily job | The purge is an application transaction with SRS 11.14 preconditions, not standalone DDL. |

This is a documented blocker, not a silent weakening. Adding these with the
dependent schema groups is required before production. The current schema has
exactly two foreign keys pointing at `volunteers`:
`volunteer_domains.roll_number` (delete the person's domain rows) and
`volunteers.notes_updated_by` (update other rows to `SYSTEM`). The future
permanent-delete function must handle both, and every later FK in the same
migration that adds it (SRS rule 26).

### 6.4 Rollback considerations

The migration is forward-only. A local rollback, if ever needed, is a manual
reviewed operation in reverse dependency order:

```sql
drop table public.volunteer_domains;
drop table public.volunteers;
drop table public.projects;
drop type public.blood_group;
drop type public.creative_domain;
drop type public.gender;
drop type public.volunteer_status;
```

This destroys data and is **not** a production rollback plan. Production
recovery uses the weekly backup/restore procedure (SRS 19.2) or a reviewed
forward fix; no down migration is included. The manual SQL has no automatic
rollback: dropping `app_user` requires revoking its object privileges first, and
dropping the `SYSTEM` row is not part of a normal rollback. The
`__drizzle_migrations` ledger is what makes `db:migrate` a no-op on a second run.

## 7. Validation history

### Task 1 — infrastructure (19 Oct 2026)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed. |
| `npm run db:schema` | Passed; printed no SQL because the schema was intentionally empty. |
| `npm run db:generate` | Passed, loaded the schema barrel, reported `0 tables` and `No schema changes, nothing to migrate`; created the baseline `drizzle/meta/_journal.json`. |
| `npm run db:check` | Passed (`Everything's fine`). |
| `createDatabase()` with a placeholder URL via `tsx` | Created a typed Drizzle handle and postgres-js client without connecting; `client.end()` completed cleanly. |
| `npm run db:migrate` with no admin URL | Failed safely with `Please provide required params for Postgres driver: [x] url: ''`; no connection was attempted. |
| `npm run build` | Passed; no page imports the database module, so the build does not open a connection. |

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

### Task 3 — initial migration and manual SQL (19 Oct 2026)

Environment: disposable Docker `postgres:17-alpine`, PostgreSQL 17.11, database
`nss_test`, admin user `postgres`, local-only port `55432`. No Supabase project
was used.

| Command / check | Actual result |
|---|---|
| `npm run db:generate` | Created `drizzle/0000_moaning_ricochet.sql`; reported 3 tables, 4 enums, 3 indexes and 3 foreign keys. |
| Reviewed generated SQL | Matched SRS 8.1/8.2 field-by-field. Added only the `fillfactor = 85` migration-level statement. |
| `ADMIN_DATABASE_URL=... npm run db:migrate` | Passed; migration applied to the disposable database. |
| `npm run db:migrate` again | Passed; Drizzle's `__drizzle_migrations` ledger made it a no-op. |
| `npm run db:generate` again | Passed with `No schema changes, nothing to migrate`. |
| `npm run db:check` | Passed (`Everything's fine`). |
| Catalog inspection (`information_schema`, `pg_class`, `pg_indexes`, `pg_constraint`) | 3 tables, 4 enums, 8 indexes, 15 constraints; `volunteers` `reloptions = {fillfactor=85}`. |
| Constraint test script | Passed (`CONSTRAINT_TESTS_OK`): rejected invalid roll number, short name, invalid phone, overlong hostel/city/notes, out-of-range batch year, invalid enum values, duplicate PK/unique values and missing FKs; confirmed `ON DELETE RESTRICT` for project, volunteer and self-referencing editor FKs. |
| Apply `drizzle/manual/security.sql` twice | Both runs passed; second run inserted 0 SYSTEM rows. |
| `app_user` attributes | `rolcanlogin = true`, `rolsuper = false`, `rolcreatedb = false`, `rolcreaterole = false`, `rolbypassrls = false`. |
| `app_user` privileges | SELECT/INSERT/UPDATE/DELETE on `volunteers`; no `CREATE` on schema `public`; a `CREATE TABLE` attempt failed with `permission denied for schema public`. |
| RLS state | Enabled on `projects`, `volunteers`, `volunteer_domains`; `app_all` policy exists for `app_user` on all three. |
| RLS probe | A role with SELECT but no policy saw 0 rows; `app_user` saw the expected row. |
| `SYSTEM` row | Present once with `gender = OTHER`, `batch_year = 2000`, `status = ARCHIVED`; a second apply did not duplicate it. |
| Temporary `audit_log` table | `security.sql` enabled RLS, created only `audit_read`/`audit_insert`, and left `app_user` with SELECT/INSERT but not UPDATE/DELETE/TRUNCATE. `app_user` inserted a synthetic business row and an audit row in one transaction, then rolled back. A real `UPDATE` attempt failed with `permission denied for table audit_log`. The test table was dropped afterward. |
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed; existing application pages still build. |

**Not verified:** Supabase-specific role membership, session-mode pooler
behaviour, `pg_cron`, a real `audit_log`, the deferred permanent-delete/purge
functions, staging or production migration application, and backup/restore.

## 8. Known limitations and next steps

- Only the foundational schema group is implemented. `office_assignments`,
  `red_flags`, `approval_requests`, `import_batches`, events, meetings, hours,
  audit and system tables are still pending.
- `drizzle/manual/security.sql` covers only the applicable SRS 8.7 SQL. The
  audit-purge function/schedule, permanent-delete function, counter functions
  and retention operations are deferred until their tables exist; see
  `drizzle/manual/README.md`.
- `audit_log` does not exist, so audit immutability is not yet active. The
  guarded block in `security.sql` is ready for the schema group that adds it.
- `app_user` has table-wide `UPDATE` because SRS 8.7 grants it. The rule that
  cached counters change only through the named application functions is
  enforced by code review and services, not by column privileges.
- RLS allows `app_user` all rows; project/role scope is enforced by repository
  SQL. RLS's job here is to block the public Supabase API roles, not to
  implement application authorization.
- `fillfactor` is set by a manual edit in the generated migration. Future
  `db:generate` runs create new migrations; do not regenerate or rewrite
  `0000_moaning_ricochet.sql` after it has been applied anywhere.
- `db:studio` uses the admin connection and is restricted to `127.0.0.1`.
  Do not expose it or run it against production.
- The next schema group in SRS order is `office_assignments` with `user_role`,
  `tech_kind`, `builder_kind` and `access_status`. After that: `red_flags`,
  `approval_requests`, `import_batches`, then events/meetings/hours/audit.
