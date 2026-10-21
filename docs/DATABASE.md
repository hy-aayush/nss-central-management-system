# Database Infrastructure, Foundational Schema and Initial Migration (as built)

**Status:** Task 1 infrastructure, Task 2A foundational schema, Task 3 initial
migration/manual security SQL, the seed + database integration test work, and
the Task 5 office-assignment schema group are implemented. The migrations, seed
and 119 integration tests were run only against a disposable local PostgreSQL
17.11 database. No staging or production database was contacted.
**Date:** 21 Oct 2026 (Task 5 office-assignment pass; Task 4 seed/test pass;
earlier sections dated 19 Oct 2026).
**Authority:** `docs/SRS.md` (Sections 2.2, 3.1 rules 13, 20 and 26, 8, 9.4, 16.1,
19.1 and Appendices A and D).

> The foundational schema group (`projects`, `volunteers`, `volunteer_domains`)
> and the office-assignment group (`office_assignments` with `user_role`,
> `tech_kind`, `builder_kind`, `access_status`) exist. The SRS 8.7 audit-purge,
> permanent-delete, counter and retention functions, `pg_cron`, and later schema
> groups do **not** exist yet. `drizzle/manual/security.sql` is intentionally
> limited to the SQL that is valid for this schema, and the seed writes only the
> nine fixed projects plus optional synthetic fixtures. Appendix A.2–A.5 seed
> data waits for the tables it belongs to.

---

## 1. Responsibilities

| Path | Responsibility |
|---|---|
| `src/db/client.ts` | Typed Drizzle + `postgres` (postgres-js) connection factory. Contains the Supavisor pool settings. Takes an explicit connection string so scripts/tests can use a staging or local URL. |
| `src/db/index.ts` | **Server-only** application entry point. Imports `server-only`, reads `DATABASE_URL` lazily and caches one Drizzle handle on `globalThis` for the lifetime of a serverless instance. Also exports `closeDatabase()` for scripts/tests. |
| `src/db/schema/enums.ts` | The eight enums required so far: `gender`, `volunteer_status`, `blood_group`, `creative_domain`, `user_role`, `tech_kind`, `builder_kind`, `access_status`. |
| `src/db/schema/projects.ts` | SRS 8.2 `projects`. |
| `src/db/schema/volunteers.ts` | SRS 8.2 `volunteers`. |
| `src/db/schema/volunteer-domains.ts` | SRS 8.2 `volunteer_domains`. |
| `src/db/schema/office-assignments.ts` | SRS 8.3 `office_assignments` (roster + role history; PR slots; the `oa_shape`/`oa_pr_slot_uq`/`oa_active_role_uq` rules). |
| `src/db/schema/index.ts` | Single Drizzle schema barrel. Every schema file must be re-exported here. |
| `drizzle.config.ts` | Drizzle Kit configuration. Points at the schema barrel and `drizzle/`; reads **`ADMIN_DATABASE_URL`**, never `DATABASE_URL`. |
| `drizzle/0000_moaning_ricochet.sql` | First migration file: four enums, three tables, seven checks, three indexes, three foreign keys, two unique constraints and the reviewed `volunteers` fillfactor statement. |
| `drizzle/0001_tired_agent_zero.sql` | Second migration file: `office_assignments` with four enums, ten checks, four indexes, four foreign keys and two unique constraints. |
| `drizzle/meta/` | Drizzle journal and snapshots for both migrations. |
| `drizzle/manual/security.sql` | SRS 8.7 role, grants, audit restrictions, RLS, timeouts and `SYSTEM` row. Repeatable. |
| `drizzle/manual/README.md` | Manual-SQL order, local role prerequisites and deferred SRS blocks. |
| `src/db/seed/reference-data.ts` | Pure SRS Appendix A.1 fixed project rows; no env, no database import. |
| `src/db/seed/fixtures.ts` | Optional, clearly synthetic volunteers and domains (SRS rule 20). |
| `src/db/seed/index.ts` | Idempotent seed operations (`on conflict do nothing`) and drift reporting. |
| `src/db/seed/targets.ts` | Seed-target guard: production refusal and remote-host opt-in. |
| `src/db/seed/validation.ts` | Zod validation for seed rows; issues never echo a value. |
| `scripts/seed.ts` | `npm run db:seed`: dry run by default, `--apply`, `--fixtures`, `--url`. |
| `scripts/apply-security.ts` | `npm run db:security`: applies `drizzle/manual/security.sql` without psql. |
| `scripts/lib/*.ts` | Shared `.env` loader and migration/manual-SQL helpers used by scripts and tests. |
| `tests/db/*.test.ts`, `tests/db/harness.ts` | Real-PostgreSQL integration tests and the scratch-database harness. |
| `vitest.config.mts` | Vitest configuration; one test file at a time, 30 s test timeout. |
| `.env.example` | Placeholder-only environment contract, including the local test URL. |

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
| `TEST_ADMIN_DATABASE_URL` | Local/CI test runs only | Disposable local PostgreSQL admin URL for `npm run test:db`. Loopback only unless `ALLOW_REMOTE_TEST_DB=1`. |

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
   `npm run db:security` (equivalent to
   `psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/manual/security.sql`;
   the script exists because psql is not installed everywhere).
6. Re-run the manual SQL after adding a table so the RLS loop and default
   privileges cover it.
7. Run the seed (see Section 7) and `npm run test:db` on a clean database.
8. Record the verified result and any index/size measurements in this file.

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

## 7. Seed data (Task 4)

### 7.1 What is seeded

| Kind | Source | Rows | When |
|---|---|---|---|
| Fixed reference data | `src/db/seed/reference-data.ts` | The nine SRS Appendix A.1 projects (ids 1–9) | Every environment, explicitly |
| `SYSTEM` row | `drizzle/manual/security.sql` | 1 | With the manual SQL, not the seed script |
| Optional synthetic fixtures | `src/db/seed/fixtures.ts` | 6 volunteers (`999xxxx`) and 5 domain rows | Only with `--fixtures`; local dev/tests |

The nine rows use the exact Appendix A.1 fields: `id`, `name`, `slug` and `sdgs`.
`tagline` and `description` are empty strings until the NSS team supplies copy.
`accent_color` is a UI choice and the UI spec does not define project colours
yet, so the seed uses the hues already present in the prototype's
`PROJECT_COLOR_MAP` as `#rrggbb` values (`#10b981` … `#f97316`). That column is
editable data, not a business identifier.

Deliberately **not** seeded yet: Appendix A.2 event categories, A.3 adjustment
tags, A.4 settings and the A.5 staff CSV rows. Their tables
(`event_categories`, hours types, `settings`) do not exist, and the A.5 staff
seed additionally needs the all-or-nothing validated CSV plus its
`office_assignments` posts; adding invented columns would be worse than waiting.

### 7.2 Exact commands

```bash
# Dry run (read-only; the default)
npm run db:seed

# Write the nine fixed projects
npm run db:seed -- --apply

# Also write the synthetic development/test volunteers
npm run db:seed -- --apply --fixtures

# Explicit database instead of ADMIN_DATABASE_URL
npm run db:seed -- --url "postgresql://postgres:postgres@127.0.0.1:55432/nss_dev" --apply
```

`ADMIN_DATABASE_URL` is the same admin connection the migrations use
(session-mode pooler / 5432 on Supabase). The seed never uses `DATABASE_URL`.

### 7.3 Idempotency and drift

- Inserts use `on conflict do nothing` and existing rows are never updated or
deleted, so running the seed twice inserts nothing new (SRS Appendix A.5) and
never overwrites a tagline, description or accent colour the team edited.
- `seedProjectReferenceData()` returns `inserted`, `skipped`, `total` and
`drift`. Drift compares only the fixed fields (`id`, `name`, `slug`, `sdgs`)
and the CLI prints a warning for each mismatch without fixing it. Fixing a fixed
field needs a reviewed migration, not a silent seed update.
- Synthetic fixtures are skipped row by row on a second run. They need the
project rows first because `volunteers.project_id` is a foreign key; the seed
refuses with a clear message instead of surfacing a raw FK error.
- The `SYSTEM` row (Appendix A.6) is owned by `security.sql` and inserted with
`ON CONFLICT DO NOTHING`; the seed does not duplicate it.

### 7.4 Safety rules

- Nothing runs the seed automatically. It is not in `dev`, `build`, `start`,
`postinstall` or any other lifecycle script; `tests/db/seed-guards.test.ts`
asserts this against `package.json`.
- `NODE_ENV=production` and `SEED_TARGET=production` are always refused
(exit code 1). A remote host also requires `SEED_TARGET=staging` **and**
`SEED_ALLOW_REMOTE=1`, for an explicitly approved staging database only.
- The default is a dry run; writing needs `--apply`.
- Fixtures are clearly synthetic: names start with `Synthetic Volunteer`, roll
numbers come from the reserved `999xxxx` block, there are no phone numbers,
hostels, blood groups, city/state values or email fields, and every row's notes
carry `SYNTHETIC TEST FIXTURE`. A test asserts no fixture reuses an Appendix A.5
staff roll number.
- No production roster, real email, phone number or staff detail is in the
repository; `src/db/seed/*` has no personal data at all.
- Output prints only the host/port/database (never a password) and counts, not
field values.

## 8. Integration tests against real PostgreSQL (Task 4)

### 8.1 Creating a clean local test database

```bash
docker run -d --name nss-task4-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -p 55432:5432 postgres:17-alpine

# Wait until it accepts connections
docker exec nss-task4-pg pg_isready -U postgres

export TEST_ADMIN_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres"
```

PowerShell: `$env:TEST_ADMIN_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres"`.

Remove it afterwards with `docker rm -f nss-task4-pg`. No project file stores
this URL; `.env.example` only has the placeholder.

The harness requires a loopback host. `ALLOW_REMOTE_TEST_DB=1` exists only for
an explicitly approved staging database and is not a normal workflow.

### 8.2 Exact commands

```bash
# Apply committed migrations to a database
ADMIN_DATABASE_URL="postgresql://..." npm run db:migrate

# Apply the repeatable manual security SQL (role, grants, RLS, SYSTEM row)
ADMIN_DATABASE_URL="postgresql://..." npm run db:security

# Seed fixed projects and (optionally) synthetic fixtures
ADMIN_DATABASE_URL="postgresql://..." npm run db:seed -- --apply

# Run every database integration test
TEST_ADMIN_DATABASE_URL="postgresql://..." npm run test:db
```

`npm run test:db` runs Vitest 4.1.12. Vitest 5 requires `@types/node` ≥ 22 while
this repository pins `@types/node@20`; 4.1.12 is the newest version that supports
Node 20 types and does not pull the vulnerable `tinypool` chain. The tests are
not wired into CI yet.

### 8.3 What the harness does

`tests/db/harness.ts` creates a uniquely named database
(`nss_test_<label>_<random>`) on `TEST_ADMIN_DATABASE_URL`, applies the real
`drizzle/` migrations through the same Drizzle migrator the scripts use, and
drops it with `with (force)` in `cleanup()`. It also creates the `anon` and
`authenticated` roles that `security.sql` deliberately revokes from, and can set
a temporary password on `app_user` so tests can connect as the real application
role. The password is generated per run and never committed.

Files run one at a time (`fileParallelism: false`) because they create
databases and set a cluster-wide role password. Every test file owns its
database, so no test depends on another file's rows.

### 8.4 Coverage and verified schema

The migration test inspects the catalog directly and verifies the schema this
repository actually creates: 4 tables, 8 enums with the SRS value order,
12 indexes (4 named + 4 primary keys + 2 unique constraints + 2 PostgreSQL
implicit), 23 constraints (4 primary keys, 2 unique, 10 checks by name, 7
foreign keys with `ON DELETE RESTRICT`), and
`volunteers.reloptions = {fillfactor=85}`.

| Required area | Test | Result |
|---|---|---|
| Migration on a clean database | `tests/db/migrations.test.ts` | Passed (empty `public` schema → migrated, one ledger row, second run a no-op) |
| Required fields and nullability | `tests/db/constraints.test.ts` | Passed (NOT NULL on roll/name/gender/batch/counters; optional fields accept NULL; defaults applied) |
| Enum and CHECK violations | `tests/db/constraints.test.ts` | Passed (8 enums; all 10 checks and their boundary values) |
| Primary, unique and foreign keys | `tests/db/constraints.test.ts` | Passed (duplicate PK/slug/name/domain pair; 10 foreign-key cases; RESTRICT deletes) |
| Project integrity | `tests/db/constraints.test.ts` | Passed (exactly ids 1–9 seeded; no orphan `project_id`; FK rejects 999) |
| Office-assignment integrity | `tests/db/constraints.test.ts` | Passed (`oa_shape`, PR slot 1–2 and end-reason checks, `oa_active_role_uq` frees the post when ended, `oa_pr_slot_uq` two-slot limit, four RESTRICT foreign keys) |
| Audit UPDATE/DELETE restrictions as `app_user` | `tests/db/audit-access.test.ts` | Passed (SELECT/INSERT allowed; UPDATE, DELETE and TRUNCATE fail with `42501`; row intact) |
| Counter invariants | `tests/db/constraints.test.ts` | Partial: `numeric(7,1)` rounding and overflow verified; SRS 11.10 counter functions are `it.todo` |
| Seed twice without duplicates | `tests/db/seed.test.ts` | Passed (9 → 9 projects, 6 → 6 volunteers, 5 → 5 domain rows) |
| Seed safety and no auto-run | `tests/db/seed-guards.test.ts` | Passed (production refusal, remote opt-in, no lifecycle script) |

The audit test creates an `audit_log` stand-in with the SRS 8.6 shape in its own
scratch database (text instead of the `user_role`/`audit_outcome` enums that
belong to a later schema group), applies the real `security.sql`, and tests the
guarded block with a real `app_user` connection. This verifies the SQL that is
committed today; the real table must be re-tested when its schema group lands.

### 8.5 Actual results (21 Oct 2026)

Environment: Docker `postgres:17-alpine`, PostgreSQL 17.11, local port 55432,
container `nss-task4-pg`. No Supabase, staging or production database used.

| Command / check | Actual result |
|---|---|
| `npm run db:migrate` on a fresh database | Passed; `migrations applied successfully`. |
| `npm run db:security` twice | Passed; second run idempotent (one `SYSTEM` row). |
| `npm run db:seed` (dry run) | `0/9 present; 9 would be inserted`, nothing written. |
| `npm run db:seed -- --apply` | `9 inserted, 0 already present (9/9 total)`. |
| Second `--apply` run | `0 inserted, 9 already present`; still 9 rows. |
| `--apply --fixtures` twice | First: 6 volunteers + 5 domain rows inserted. Second: 0 + 0 inserted, all present. |
| Row counts after the CLI run | `projects=9`, `volunteers=7` (`SYSTEM` + 6 fixtures), `fixtures=6`, `domains=5`, `system=1`. |
| `NODE_ENV=production npm run db:seed -- --apply` | Refused, exit code 1: `Refusing to seed: NODE_ENV=production`. |
| `SEED_TARGET=production npm run db:seed -- --apply` | Refused, exit code 1: `Refusing to seed: SEED_TARGET=production`. |
| `npm run test:db` (Vitest 4.1.12) | **5 files passed, 79 tests passed, 2 todo (81 total), 8.94 s**; exit 0. |
| `npx tsc --noEmit` | Passed (exit 0). |
| `npm run lint` | Passed (exit 0). |
| `npm run build` | Passed; all existing pages build, exit 0. |

**Not verified:** Supabase role membership, session/transaction pooler behaviour,
`pg_cron`, the real `audit_log`, the SRS 11.10 counter functions, staging or
production migration, and backup/restore.

### 8.6 Limitations

- The SRS 11.10 counter functions do not exist; counter tests cover column
  defaults, nullability and numeric precision only.
- The real `audit_log` table does not exist. Its immutability rules were tested
  against the SRS 8.6 stand-in described above.
- Tests run against local PostgreSQL only. Supabase-specific behaviour (pooler,
  role membership, `pg_cron`) is untested.
- The integration suite is not part of CI yet; it needs a PostgreSQL service
  container or the documented Docker command.

## 9. Validation history

### Task 5 — office-assignment schema group and access gate (21 Oct 2026)

Environment: Docker `postgres:17-alpine`, PostgreSQL 17.11, local port 55432,
container `nss-task5-pg` (removed after the run). No Supabase, staging or
production database was contacted.

| Command / check | Actual result |
|---|---|
| `npm run db:generate` | Created `drizzle/0001_tired_agent_zero.sql`: `office_assignments` plus `user_role`, `tech_kind`, `builder_kind`, `access_status` enums. |
| `npm run db:migrate` on a clean database | Passed; both migrations applied, ledger shows 2 rows; second run a no-op. |
| Catalog inspection via `tests/db/migrations.test.ts` | 4 tables, 8 enums in SRS order, 12 indexes, 23 constraints (10 checks, 7 RESTRICT FKs, 4 PKs, 2 uniques). |
| `tests/db/constraints.test.ts` (office-assignment section) | Passed: `oa_shape` for all four role kinds, PR slot 1–2, end-reason length, `oa_active_role_uq` frees the post when ended, `oa_pr_slot_uq` two-slot limit, all four foreign keys reject with `23503`. |
| `tests/db/access-gate.test.ts` | Passed (9 tests, see PROGRESS Task 5): active coordinator and multi-post grant; no-post, suspended, revoked, suspended-volunteer, archived-volunteer and missing-volunteer deny; roll-number matching. |
| `npx vitest run` | **9 files passed, 118 tests passed, 1 todo (119 total), 13.4 s**; exit 0. |
| `npx tsc --noEmit`, `npm run lint`, `npm run build` (with and without Supabase env) | All passed, exit 0. |

### Task 4 — seeds and integration tests (21 Oct 2026)

Environment and every command result are recorded in Section 8.5. In summary:
`npm run test:db` passed 5 files / 79 tests with 2 documented todos; the seed
CLI inserted 9 projects and 6 synthetic fixtures and inserted nothing on a
second run; `NODE_ENV=production` and `SEED_TARGET=production` were refused with
exit code 1; `npx tsc --noEmit`, `npm run lint` and `npm run build` all exited 0.
Nothing was committed or pushed.

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

## 10. Known limitations and next steps

- The foundational group and `office_assignments` are implemented.
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
- The seed covers Appendix A.1 only. A.2 event categories, A.3 adjustment tags,
  A.4 settings and A.5 staff CSV rows need their tables first (A.5's posts now
  have a home in `office_assignments`, but the validated CSV flow is still
  pending).
- One integration test is `it.todo` because its object does not exist (the SRS
  11.10 counter functions). It is reported as skipped, never as passed.
  Replace it with a real test in the same change that adds those functions.
- The audit-immutability test uses a SRS 8.6 stand-in table in a scratch
  database. Re-run it against the real `audit_log` when its schema group lands.
- `npm run test:db` is not wired into CI and runs against local PostgreSQL only.
- The next schema group in SRS order is `red_flags`, then `approval_requests`,
  `import_batches`, then events/meetings/hours/audit. When it lands, extend
  `scripts/seed.ts` with the A.5 staff CSV seed.
