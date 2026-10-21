# Database Foundation Progress

## Task 5 — Supabase Google authentication and the office access gate (21 Oct 2026)

**Scope:** Google sign-in via Supabase Auth, server-side identity verification
with `getClaims()`, the database-backed office access gate on every private
entry point, sign-out with session cleanup, safe return URLs, and the
`office_assignments` schema group the gate reads. No role-permission system
(`can()`, packs, scopes) — that is the next task. No email/password login, no
public volunteer accounts.

**Status:** Complete, awaiting review. Changes are uncommitted in the working
tree; nothing was committed or pushed.

### Architecture (exactly SRS 2.4, 4.4 and 16.2)

1. `/login` posts to a Server Action that starts the Supabase Google OAuth flow
   (`hd=kiit.ac.in` hint, PKCE verifier in an HttpOnly cookie).
2. `/auth/callback` exchanges the code, then **verifies the JWT locally** with
   `supabase.auth.getClaims()` (present in the pinned `@supabase/ssr@0.12.7` /
   `@supabase/supabase-js@2.118.0`; asymmetric keys verify against a cached
   JWKS, no network round-trip per request). `getSession()` is never used on the
   server.
3. Verified claims yield identity only (`email`, `email_verified`, optional
   `hd` must match, local part must match `ROLL_NUMBER_PATTERN`). Roles are
   never read from the JWT (SRS 2.4).
4. `resolveOfficeAccess()` runs one indexed SQL join against `volunteers` +
   active `office_assignments` (`ends_at is null` and
   `access_status = 'ACTIVE'`). Deny by default: missing volunteer,
   suspended/archived volunteer, no active post, DB failure all deny.
5. `requireOfficeAccess()` is called by the `(office)` layout, the
   `(office)` template (re-runs per client navigation), the root design page
   and **every private page component** before any mock/DB read. The proxy
   (`src/proxy.ts`) is optimistic only: it verifies the session signature and
   redirects anonymous visitors, but is never the authorization decision.
6. Denials stream a `NEXT_REDIRECT` to `/auth/denied`, which revokes the
   Supabase session, deletes the cookies and shows the minimal `/access-denied`
   page (no role, reason, email or roll disclosure).
7. Sign-out is POST-only with an Origin check (GET → 405, cross-origin → 403),
   calls `auth.signOut()`, deletes cookies and sends
   `Clear-Site-Data: "cache"`.

### Files added or changed

| File | Change |
|---|---|
| `src/db/schema/enums.ts` | Added `user_role`, `tech_kind`, `builder_kind`, `access_status` enums. |
| `src/db/schema/office-assignments.ts`, `src/db/schema/index.ts` | Added SRS 8.3 `office_assignments` (shape check, PR-slot rules, active-role uniqueness) and exported it. |
| `drizzle/0001_tired_agent_zero.sql`, `drizzle/meta/*` | Generated migration for the above. |
| `src/lib/supabase/config.ts` | Validated public env reader (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`); missing pair degrades to "not configured", never crashes the build. No service-role key exists in the app. |
| `src/lib/supabase/server.ts` | Per-request Server-Component client (HttpOnly/SameSite=Lax/Secure cookies; `setAll` failure swallowed, proxy refreshes). |
| `src/lib/supabase/route.ts` | Route-Handler client that collects cookie writes and `apply()`s them onto the real response with `private, no-store`. |
| `src/lib/auth/claims.ts` | `identityFromClaims()` — verified email/domain/hd/roll validation; never trusts roles or `user_metadata`. |
| `src/lib/auth/session.ts` | `getSession()` — `getClaims()`-based session state (`React.cache` per request). |
| `src/lib/auth/gate.ts` | `resolveOfficeAccess()` — the DB join; pure and testable without Next.js. |
| `src/lib/auth/actor.ts` | `loadOfficeAccess()` / `requireOfficeAccess()` — the gate every entry point calls; DB failure denies. |
| `src/lib/auth/return-to.ts` | `sanitizeReturnTo()` — same-origin absolute paths only; auth pages, schemes, `//`, backslashes, control chars and overlong values fall back to `/dashboard`. |
| `src/lib/auth/actions.ts` | `signInWithGoogle()` Server Action (PKCE, `hd` hint, `prompt=select_account`). |
| `src/lib/auth/display.ts` | Display-only initials and highest-post label for the shell (never used for authorization). |
| `src/lib/platform/request-origin.ts` | `getRequestOrigin()` — `APP_ORIGIN` wins, forwarded host fallback; never from `?next=`. |
| `src/app/auth/callback/route.ts` | Code exchange + claims verification + gate; verified-but-unapproved → signed out → `/access-denied`. |
| `src/app/auth/signout/route.ts` | POST-only sign-out with Origin check and `Clear-Site-Data`. |
| `src/app/auth/denied/route.ts` | Gate-denial cleanup: revoke, delete cookies, redirect to the minimal denied page. |
| `src/proxy.ts` | Next 16 proxy: signature check + anonymous redirect + cookie refresh; `/` is no longer public. |
| `src/app/(auth)/login/page.tsx` | Real login page: Google button (disabled when unconfigured), safe `next`, honest error notices. |
| `src/app/(auth)/access-denied/page.tsx` | Minimal denied page; sign-out form and back-to-sign-in only. |
| `src/app/(office)/layout.tsx`, `template.tsx` | Gate before the shell renders; template re-runs it on every client navigation. |
| All 18 private `page.tsx` files (incl. `src/app/page.tsx`) | `await requireOfficeAccess()` before any data read + `export const instant = false` so private pages are never prerendered. |
| `src/components/layout/app-sidebar.tsx`, `topbar.tsx` | Real identity (initials, highest-post label) wired from the gate instead of mock constants. |
| `.env.example` | Replaced a leaked real-looking pooler URL with a placeholder; documented the Supabase Auth variables. |
| `tests/auth/claims.test.ts` | 9 tests: verified email, case normalization, hd match/mismatch, unverified, bad domain, bad roll, roles-never-trusted. |
| `tests/auth/access-gate.test.ts` | 9 tests against real PostgreSQL: active/multi-post grant; no-post/suspended/revoked/suspended-volunteer/archived/missing-volunteer deny; roll-number matching. |
| `tests/auth/return-to.test.ts` | 5 tests: internal paths kept; scheme/`//`/backslash/auth-page/overlong/control rejected. |
| `tests/auth/proxy.test.ts` | 6 tests: anonymous redirect with `next`; forged cookie fails closed; `/` protected; public auth pages pass; redirects uncacheable. |
| `tests/db/harness.ts`, `constraints.test.ts`, `migrations.test.ts` | `insertAssignment` helper; office-assignment constraint tests; migration catalog expectations updated to 4 tables / 8 enums. |
| `docs/DATABASE.md`, `docs/DECISIONS.md`, `docs/PROGRESS.md` | Schema counts, decisions D-028…D-031 and this record. |

### Commands and actual results

Environment: Docker `postgres:17-alpine`, PostgreSQL 17.11, port 55432.
No real Supabase project, Google account or personal data was contacted.

| Command / check | Actual result |
|---|---|
| `npx vitest run` (with `TEST_ADMIN_DATABASE_URL`) | **9 files passed, 118 passed, 1 todo (119), 13.4 s**; exit 0. |
| `npx tsc --noEmit` | Passed; exit 0. |
| `npm run lint` | Passed; exit 0. |
| `npm run build` with Supabase env | Passed; every office route is `ƒ` (dynamic), no private page prerendered. |
| `npm run build` with **no** Supabase env (clean checkout) | Passed; login shows an honest "not configured" notice with a disabled button; private routes still redirect. |
| HTTP probe, unauthenticated | `/`, `/dashboard`, `/volunteers`, `/team`, `/volunteers/2105101` → **307** to `/login?next=…`, `cache-control: private, no-store`. |
| HTTP probe, forged cookie | **307** to `/login` (proxy fails closed; JWKS signature check rejects it). |
| HTTP probe, signed-but-unapproved identities (no post, suspended post, revoked post, suspended volunteer, missing volunteer, gmail.com, wrong hd, unverified email) | Dashboard/volunteers/team/projects/settings stream the `NEXT_REDIRECT` to `/auth/denied`; response contains **zero** volunteer records, names, roll numbers, metrics or actor identity; no sidebar/nav HTML. |
| Browser-like follow of a denied session | `/dashboard` → `/auth/denied` (**307**, session cookie deleted) → `/access-denied` (200, minimal page) → `/dashboard` now **307** to `/login`. |
| HTTP probe, valid coordinator | 200 on `/dashboard`, `/volunteers`, `/team`, `/projects`, `/settings`, `/`, `/volunteers/2105101`; shell shows the real name and "Coordinator" label; no redirect markers. |
| Sign-out POST with matching `Origin` | **303** to `/login`, `clear-site-data: "cache"`, auth cookie deleted. |
| Sign-out POST without `Origin` | **403** (CSRF). |
| Sign-out GET | **405**. |
| `npm run db:generate` + clean-database migrate | Migration `0001` applies; catalog = 4 tables, 8 enums, 12 indexes, 23 constraints (verified by `migrations.test.ts`). |

The E2E probe used a local fake Supabase Auth endpoint serving an RS256 JWKS
and forged/valid session cookies; it exercised the real built server, real
proxy, real `getClaims()` verification and the real PostgreSQL gate. No real
Google account or Supabase project was involved.

### Remaining manual setup (Supabase dashboard — cannot be scripted here)

1. **Enable the Google provider**: Supabase Dashboard → Authentication →
   Providers → Google. Create an OAuth client in Google Cloud Console with the
   redirect URL Supabase shows (`https://<project-ref>.supabase.co/auth/v1/callback`),
   then paste the client ID and secret into Supabase.
2. **Restrict to the institute domain**: in the Google consent screen set the
   authorized domain to `kiit.ac.in`, and in Supabase → Authentication →
   Providers → Google disable "Allow new users" if the NSS team wants
   invite-only behaviour. The app re-checks the domain server-side regardless.
3. **Redirect URLs**: Supabase → Authentication → URL Configuration → add
   `https://<vercel-domain>/auth/callback` (and `http://localhost:3000/auth/callback`
   for local dev) to the allow-list. Set the Site URL to the production origin.
4. **Environment variables** (Vercel project settings, and `.env` locally):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both public by
   design), plus `DATABASE_URL` (app_user pooler) and `APP_ORIGIN`. The
   service-role key must never be added to the app (SRS 16.3).
5. **Grant office posts**: once the A.5 staff CSV flow exists, posts are
   granted through the roster; until then insert `office_assignments` rows
   manually (with `granted_by` = an existing volunteer roll, e.g. `SYSTEM`).
   A signed-in account with no active post always sees the denied page.

## Task 4 (seed/test track) — Safe synthetic seeds and database integration tests (21 Oct 2026)

**Scope:** The fixed SRS Appendix A.1 project seed data, an idempotent seed CLI
with production guards, optional clearly synthetic development fixtures, and
real-PostgreSQL integration tests for the foundational schema. No authentication,
API routes, business UI or later schema groups were touched. (This is the
seed/test task; the SRS build step labelled "Task 4" earlier in this file is
authentication.)

**Status:** Complete, awaiting review. Changes are uncommitted in the working
tree; nothing was committed or pushed.

### Files added or changed

| File | Change |
|---|---|
| `src/db/seed/reference-data.ts` | Added the nine fixed Appendix A.1 projects with empty tagline/description and documented UI accent defaults. Pure data: no env, no database import. |
| `src/db/seed/fixtures.ts` | Added optional synthetic volunteers (`999xxxx` rolls, `Synthetic Volunteer NN` names, no contact details) and five domain rows. |
| `src/db/seed/index.ts` | Added idempotent `seedProjectReferenceData`, `seedSyntheticFixtures`, read-only plans and drift reporting. |
| `src/db/seed/targets.ts` | Added the seed guard: refuses `NODE_ENV=production`, `SEED_TARGET=production` and unapproved remote hosts; prints host/port/database only. |
| `src/db/seed/validation.ts` | Added Zod validation for seed rows; issues are row/field/message only and never echo a value. |
| `scripts/seed.ts` | Added the seed CLI (dry run by default, `--apply`, `--fixtures`, `--url`, `--help`). |
| `scripts/apply-security.ts` | Added `npm run db:security` so the repeatable manual SQL can be applied without psql. |
| `scripts/lib/env.ts`, `scripts/lib/database-ops.ts` | Added the `.env` loader and shared migration/manual-SQL helpers used by scripts and tests. |
| `tests/db/harness.ts` | Added scratch-database creation, role setup, the app-role connection and PostgreSQL error assertions. |
| `tests/db/migrations.test.ts` | Added clean-database migration, catalog, repeat-run and manual-SQL tests. |
| `tests/db/constraints.test.ts` | Added nullability, enum, CHECK, key, foreign-key, project-integrity and numeric-counter tests. |
| `tests/db/seed.test.ts` | Added fixed-data fidelity, idempotency, drift, fixture and validation tests. |
| `tests/db/audit-access.test.ts` | Added the audit UPDATE/DELETE/TRUNCATE restriction test against the real `app_user` role. |
| `tests/db/seed-guards.test.ts` | Added pure guard tests and the "seed is never automatic" package-script check. |
| `vitest.config.mts` | Added the Vitest configuration (node environment, serial files, 30 s timeout). |
| `package.json`, `package-lock.json` | Added `vitest@4.1.12`, `tsx@4.23.15`, `db:security`, `db:seed` and `test:db`. |
| `.env.example` | Added the local `TEST_ADMIN_DATABASE_URL` placeholder. |
| `docs/DATABASE.md`, `docs/DECISIONS.md`, `drizzle/manual/README.md` | Recorded the seed/test workflow, verified results, decisions D-026/D-027 and the `db:security` command. |

### Commands and actual results

Environment: Docker `postgres:17-alpine`, PostgreSQL 17.11, local port 55432.
No Supabase, staging or production database was contacted.

| Command / check | Actual result |
|---|---|
| `npm install --save-dev vitest` | Vitest 5 refused: it needs `@types/node` ≥ 22 and this repo pins 20. Vitest 3.2.7 installed, then upgraded to **4.1.12** because 3.x pulled a critical `tinypool` advisory; `npm audit` returned to the pre-existing 13 (4 moderate, 9 high), 0 critical. |
| `npm run db:migrate` on a fresh database | Passed; `migrations applied successfully`. |
| `npm run db:security` twice | Passed; repeatable, one `SYSTEM` row. |
| `npm run db:seed` (dry run) | `Projects: 0/9 present; 9 would be inserted`; nothing written. |
| `npm run db:seed -- --apply` | `9 inserted, 0 already present (9/9 total)`. |
| Second `--apply` run | `0 inserted, 9 already present`; still 9 projects. |
| `--apply --fixtures` twice | First: 6 volunteers + 5 domain rows inserted. Second: 0 + 0 inserted. |
| Row counts after the CLI run | `projects=9`, `volunteers=7` (`SYSTEM` + 6 fixtures), `fixtures=6`, `domains=5`, `system=1`. |
| `NODE_ENV=production npm run db:seed -- --apply` | Refused, exit 1: `Refusing to seed: NODE_ENV=production`. |
| `SEED_TARGET=production npm run db:seed -- --apply` | Refused, exit 1: `Refusing to seed: SEED_TARGET=production`. |
| `npm run test:db` | **5 files passed, 79 tests passed, 2 todo (81 total), 8.94 s**; exit 0. |
| `npx tsc --noEmit` | Passed (exit 0). |
| `npm run lint` | Passed (exit 0). |
| `npm run build` | Passed; all existing pages build (exit 0). |

### Coverage

The suite verifies: migration application to a clean database and its ledger;
the four enums and their value order; 3 tables, 8 indexes, 15 constraints,
7 named CHECKs and 3 RESTRICT foreign keys; required/nullable columns and
defaults; every invalid enum and CHECK case plus boundary values; duplicate
primary/unique keys; project FK integrity and RESTRICT deletes; `numeric(7,1)`
rounding and overflow; seed fidelity to Appendix A.1, idempotency and drift;
fixture synthetic-ness and no staff-roll collision; and `app_user` being unable
to UPDATE, DELETE or TRUNCATE `audit_log`. Detail is in `docs/DATABASE.md` §8.4.

### Known limitations / deferred

- `office_assignments` does not exist, so office-assignment integrity is an
  `it.todo` (reported as skipped, not passed). The SRS 11.10 counter functions
  are likewise an `it.todo`; only column-level counter behaviour is tested.
- The real `audit_log` table does not exist. The immutability test uses the SRS
  8.6 shape in a scratch database and the real `security.sql` guarded block;
  it must be repeated against the real table later.
- Appendix A.2 event categories, A.3 adjustment tags, A.4 settings and A.5 staff
  CSV seeding wait for their tables (and `office_assignments` for staff posts).
- The suite runs only against local PostgreSQL and is not wired into CI yet.
- Supabase pooler behaviour, role membership and `pg_cron` remain untested.

### Next dependency

`office_assignments` (with `user_role`, `tech_kind`, `builder_kind`,
`access_status`) is the next schema group. It unlocks the A.5 staff seed, the
office-assignment tests and the deferred permanent-delete function. The SRS
build order otherwise still has authentication next.

---

## Frontend Quality Pass — independent-audit fixes (19 Oct 2026)

**Scope:** Implement the safe subset of the independent repository audit's
findings: real pages for the two blank auth routes, removal of dead modules and
the shadowed root route, on-demand chart loading, IST/en-IN date consistency,
and the office-wide synthetic-data banner. No authentication, authorization,
database, server-action or business-logic work; Tasks 4 and 5 were not touched.

**Status:** Complete; committed in `6dee4f3`.

### Files added or changed

| File | Change |
|---|---|
| `src/app/(auth)/login/page.tsx` | Replaced the `return null` stub with a minimal static sign-in shell (disabled provider button, no auth logic). |
| `src/app/(auth)/access-denied/page.tsx` | Replaced the `return null` stub with the minimal SRS 4.4 denied page (no role disclosure). |
| `src/app/(office)/page.tsx` | Deleted. It was shadowed by `src/app/page.tsx` at `/` and never rendered. |
| `src/lib/permissions.ts`, `src/lib/formatters.ts`, `src/providers/query-provider.tsx` | Deleted after re-verifying zero importers. |
| `src/components/dashboard/dashboard-charts.tsx` | New client wrapper loading both Recharts dashboard charts on demand (`ssr: false` + skeleton). |
| `src/app/(office)/dashboard/page.tsx` | Uses the lazy chart wrappers; academic-year badge derived from the data snapshot via `lib/time`. |
| `src/components/shared/synthetic-data-notice.tsx` | New shared server component; banner moved out of the dashboard page. |
| `src/components/shared/index.ts` | Barrel export for the new notice. |
| `src/app/(office)/layout.tsx` | Renders the synthetic-data banner on every office screen. |
| `src/lib/time.ts` | Added `academicYearLabel()` and `formatMonthYearIST()`. |
| `src/features/analytics/analytics-monthly-trends.tsx`, `analytics-kpi-header.tsx` | en-IN/IST month and date formatting via `lib/time`; academic-year labels derived from data, not hardcoded. |
| `docs/DECISIONS.md` | Recorded D-023 to D-025. |

### Commands and actual results

| Command / check | Actual result |
|---|---|
| `npm run build` (intermediate attempt 1) | Failed: plain `next/dynamic` in the Server Component page did not split the chart chunk under Cache Components (measured 424 KB gz initial, slightly worse than before). Replaced with the `ssr: false` client wrapper. |
| `npm run build` (intermediate attempt 2) | Failed prerendering `/dashboard`: `new Date()` is an unstable value during Cache Components prerender. Fixed by deriving academic-year labels from data-snapshot timestamps. |
| Stale `.next/dev/types/validator.ts` | Referenced the deleted `(office)/page.tsx` and broke type-checking until removed; it is a gitignored `next dev` artifact, regenerated on the next dev run. |
| `npm run build` (final) | Passed; 57 static pages, TypeScript step clean. |
| `npm run lint` | Passed (exit 0, no warnings). |
| `npx tsc --noEmit` | Passed (exit 0). |
| Bundle measurement (gzip of `/_next/static/chunks/*.js` referenced by each route's HTML) | `/dashboard` initial JS: **417 KB gz → 310 KB gz** (-107 KB, -26%). Recharts (92 + 16 + 8 KB gz) no longer in the initial scripts; it now loads on demand. `/volunteers` unchanged at 312 KB gz (no charts). |
| `next start` on port 3100 + browser checks | `/login`, `/access-denied`, `/dashboard`, `/volunteers` all 200. Login and denied pages render correctly in dark and light themes. Dashboard shows the banner; both lazy charts rendered (`svg.recharts-surface` x2, no skeletons left); academic-year badge shows `2026–27`; zero console errors. Server stopped and tab closed afterward. |

### Known limitations / deferred

- Google sign-in, the access gate and route protection remain Task 4 work; the
  `/login` provider button is intentionally disabled.
- `/dashboard` at 310 KB gz is still above the SRS 16.6 target of 170 KB; the
  remainder is the shared framework/shadcn/TanStack baseline, not charts. Needs
  a dedicated bundle pass after Task 4.
- `motion`, `date-fns` and `@tanstack/react-query` remain installed but unused;
  dependency removal is deferred to a dedicated decision.
- Root `/` stays a design-system page until the team decides its fate.
- Deferred audit findings: loading/error-boundary coverage on most routes,
  `/audit` vs `/audit-logs` canonical URL, header touch-target sizes, and a
  pre-existing duplicated page-title suffix (pages re-append "| NSS Central
  Management System" which the root template already adds).

### Next dependency

Task 4 — auth, access gate, `ActorContext`, permission resolver, limiter and
idempotency (SRS 16.2 and 17).

---

## Task 3 — Initial migration and manual security SQL (19 Oct 2026)

**Scope:** Review the foundational schema against the SRS, generate the initial
migration, add the applicable SRS manual SQL, and apply both to a disposable
local PostgreSQL database. No application features, later schema groups,
staging or production database were touched.

**Status:** Complete, awaiting review. The migration file is committed with
the Task 3 work (commit `2ad42a3`). The manual security SQL is
implemented only for the tables that exist; the SRS functions that depend on
later tables are documented as deferred blockers.

### Files added or changed

| File | Change |
|---|---|
| `drizzle/0000_moaning_ricochet.sql` | Generated the initial migration for four enums and three tables. Added the reviewed `ALTER TABLE volunteers SET (fillfactor = 85)` statement. |
| `drizzle/meta/0000_snapshot.json`, `drizzle/meta/_journal.json` | Added the migration snapshot and journal entry. |
| `drizzle/manual/security.sql` | Added the applicable SRS 8.7 role, grants, audit restrictions, RLS, timeouts and `SYSTEM` row. It is repeatable. |
| `drizzle/manual/README.md` | Documented apply order, local role prerequisites, password handling and every deferred SRS block. |
| `docs/DATABASE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/AI_WORKFLOW.md` | Recorded migration commands, validation, rollback considerations, decisions and the current phase. |

### Commands and actual results

Environment: Docker `postgres:17-alpine` (PostgreSQL 17.11), disposable database
`nss_test`, admin user `postgres`, local-only port `55432`. No Supabase project
was contacted.

| Command / check | Actual result |
|---|---|
| `npm run db:generate` | Passed; created `drizzle/0000_moaning_ricochet.sql` with 3 tables, 4 enums, 3 indexes and 3 foreign keys. |
| Manual review of generated SQL | Matched SRS 8.1/8.2. The only edit was the required `volunteers` fillfactor statement. |
| `ADMIN_DATABASE_URL=... npm run db:migrate` | Passed; migration applied to the disposable database. |
| `npm run db:migrate` a second time | Passed; Drizzle's ledger made it a no-op. |
| `npm run db:generate` after applying | Passed with `No schema changes, nothing to migrate`. |
| `npm run db:check` | Passed (`Everything's fine`). |
| Catalog queries | Confirmed 3 tables, 4 enum value sets, 8 indexes, 15 constraints and `volunteers.reloptions = {fillfactor=85}`. |
| Temporary SQL constraint test | Passed (`CONSTRAINT_TESTS_OK`): rejected every invalid check/enum/unique/FK case and confirmed all three `ON DELETE RESTRICT` rules. |
| `psql -f drizzle/manual/security.sql` twice | Both runs passed; the second `SYSTEM` insert returned `INSERT 0 0`. |
| Role and privilege checks | `app_user` has login and no superuser/createdb/createrole/bypassrls; it has DML on `volunteers` but cannot create tables in `public`. `anon` and `authenticated` have no table access. |
| RLS checks | RLS enabled on all three tables; `app_all` exists only for `app_user`; a role with SELECT but no policy saw 0 rows. |
| Temporary `audit_log` test | `security.sql` gave `app_user` SELECT/INSERT only. `app_user` inserted a synthetic business row and audit row in one transaction, then rolled back; a real UPDATE failed with `permission denied`. The temporary table was dropped afterward. |
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed; existing pages still build. |

### Deferred SRS blocks

- `purge_audit_log()` and the `audit-purge` `pg_cron` schedule: `audit_log`,
  `settings` and `pg_cron` do not exist yet.
- `delete_volunteer_permanently(text)`: it must handle every FK pointing at
  `volunteers`, and most of those tables are not implemented. A partial function
  would violate SRS 8.7/rule 26.
- Counter maintenance: SRS 11.10 puts it in TypeScript feature functions, not
  database functions or triggers. No generic counter function was added.
- Retention operations: they depend on events, meetings, requests and the daily
  job, which are later build steps.

These are documented in `drizzle/manual/README.md` and `docs/DATABASE.md`; they
are not silently omitted.

### Rollback considerations

- The migration is forward-only. A local rollback is a reviewed reverse-order
  `DROP TABLE`/`DROP TYPE` sequence and destroys data. It is not a production
  rollback plan.
- Production recovery uses the weekly backup/restore procedure or a reviewed
  forward fix. No down migration was committed.
- `security.sql` is repeatable, but dropping `app_user` requires revoking its
  privileges first. Dropping the `SYSTEM` row is not part of a normal rollback.
- `fillfactor` is a physical storage setting and does not change the logical
  schema.

### Unresolved issues / limitations

- No Supabase/staging/production connection was tested. Session-mode pooler
  behaviour, Supabase role membership and `pg_cron` remain unverified.
- `audit_log` does not exist, so audit immutability is not active yet. The
  guarded block in `security.sql` was tested against a temporary table.
- The permanent-delete function, audit purge and retention operations remain
  blocked until their dependent schema groups exist.
- `app_user` has table-wide `UPDATE` per SRS 8.7; the counter-update restriction
  is enforced by application code and review, not column privileges.

### Next dependency

The next schema group is `office_assignments` with `user_role`, `tech_kind`,
`builder_kind` and `access_status`. It must be followed by `red_flags`,
`approval_requests` and `import_batches`; then events, meetings, hours, audit and
system tables. The permanent-delete function and audit purge should be added as
soon as their dependencies exist.

---

## Task 2A — Foundational schema (19 Oct 2026)

**Scope:** The first SRS Section 8 schema group only: the four enums required by
this group, `projects`, `volunteers`, and `volunteer_domains`.

**Status:** Implemented. Task 3 generated and locally validated the initial
migration; no authentication, repositories, API handlers, seed rows, dashboards
or other schema groups were touched.

### Files added or changed

| File | Change |
|---|---|
| `src/db/schema/enums.ts` | Added `gender`, `volunteer_status`, `blood_group`, and `creative_domain` with the exact SRS values and SQL names. |
| `src/db/schema/projects.ts` | Added the fixed-id `projects` table, `smallint[]` SDGs, defaults and `timestamptz` activity fields. |
| `src/db/schema/volunteers.ts` | Added the full `volunteers` table, all seven SRS checks, both indexes, self/project foreign keys and stored counters. |
| `src/db/schema/volunteer-domains.ts` | Added the composite-key `volunteer_domains` table, its domain enum and domain index. |
| `src/db/schema/index.ts` | Re-exported the new files from the single schema barrel and documented the file boundaries. |
| `docs/PROGRESS.md`, `docs/DATABASE.md`, `docs/DECISIONS.md`, `docs/AI_WORKFLOW.md` | Recorded scope, validation, the pending `fillfactor` step and the next dependency. |

### Commands and actual results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Passed. |
| `npm run db:schema` | Passed and printed the SQL diff for four enums, three tables, seven checks, three indexes and three foreign keys. Compared field-by-field with SRS 8.1 and 8.2. |
| `npx tsx -e` metadata inspection via `getTableConfig` | Confirmed table/column names, SQL types, nullability, defaults, check names, index names/columns, foreign keys and delete actions, composite primary key, and enum value arrays. |
| Temporary runtime assertion file (`getTableConfig`, removed after use) | Passed (`SCHEMA_ASSERTIONS_OK`). Asserted all four enum arrays, every column name/type/nullability/default/primary/unique flag, the seven check names, both volunteer indexes, the domain index, the composite primary key, and all three foreign keys with `ON DELETE restrict`. |
| Temporary TypeScript assertion file using `InferSelectModel` / `InferInsertModel` | Passed; verified inferred nullable fields, enum unions, required insert fields and optional defaulted fields. File was removed after the check. |
| `npm run lint` | Passed with no output. |
| `npm run db:check` | Passed (`Everything's fine`). |
| `npm run build` | Passed; all existing application pages still build. |
| `drizzle/meta/_journal.json` | Still had zero entries at Task 2A. Task 3 added migration index 0. |

### SRS comparison and known gap

The generated DDL matches SRS 8.1/8.2 for all column names, SQL types,
nullability, defaults, primary keys, foreign keys, checks and indexes. Derived
`email`, academic `year`, rates and project status are intentionally absent. The
stored counters are present because SRS 8.2 explicitly permits them. The
`join_date` and `since` defaults follow the SRS `current_date`; callers should
pass an explicit IST date when near-midnight precision matters (D-021).

One gap was migration-level only: SRS 8.2 specifies
`WITH (fillfactor = 85)` on `volunteers`, but Drizzle 0.45's PostgreSQL schema
API cannot express table storage parameters. Task 3 added it to
`drizzle/0000_moaning_ricochet.sql` after the table creation; this is recorded
in D-020 and D-022.

### Unresolved issues / limitations

- No live database was contacted during Task 2A; Task 3 later applied the
  migration to a disposable local PostgreSQL database.
- `fillfactor` was added to the Task 3 migration.
- Later schema groups, the full security/functions SQL and seeds are not
  implemented.

### Next dependency

The next schema group in SRS order is `office_assignments` (roster and role
history), which also needs `user_role`, `tech_kind`, `builder_kind` and
`access_status`. After that: `red_flags`, `approval_requests`, and
`import_batches`.

---

## Task 1 — Database infrastructure (19 Oct 2026)

**Scope:** Drizzle ORM + `postgres` (postgres-js) configuration for Supabase,
the server-only typed connection module, the schema entry point, Drizzle Kit
configuration, environment template and database package scripts.

**Status:** Complete, awaiting review. Authentication, the SRS Section 8 schema,
manual security SQL, seeds and all business/UI features were deliberately not
implemented.

### Files added or changed

| File | Change |
|---|---|
| `src/db/client.ts` | Added the typed Drizzle/postgres-js connection factory with the Supavisor transaction-pooler settings (`prepare: false`, `max: 1`, short timeouts). |
| `src/db/index.ts` | Added the `server-only` application database module with lazy `DATABASE_URL` validation, a `globalThis`-cached handle and `closeDatabase()`. |
| `src/db/schema/index.ts` | Added the single schema barrel. At Task 1 it intentionally exported no tables; Task 2A now exports the foundational group. |
| `drizzle.config.ts` | Added Drizzle Kit config using the schema barrel, `drizzle/` output and `ADMIN_DATABASE_URL` only. |
| `drizzle/meta/_journal.json` | Generated baseline journal (zero migrations). |
| `.env.example` | Added the SRS Appendix D environment contract with placeholders only; notes that Drizzle Kit reads `.env`, not `.env.local`. |
| `.gitignore` | Added `!.env.example` so the placeholder template is reviewable while real `.env*` files stay ignored. |
| `package.json` / `package-lock.json` | Added `drizzle-orm`, `postgres`, `drizzle-kit` and five `db:*` scripts. |
| `docs/DATABASE.md` | Replaced the stale schema specification with verified infrastructure configuration only. |
| `docs/AI_WORKFLOW.md`, `docs/DECISIONS.md` | Reconciled the current phase and recorded D-019. |

### Commands and actual results

| Command | Result |
|---|---|
| `npm install drizzle-orm postgres` | Installed `drizzle-orm@0.45.4` and `postgres@3.4.9`; npm reported 9 high-severity advisories in the existing dependency tree. |
| `npm install --save-dev drizzle-kit` | Installed `drizzle-kit@0.31.11`; npm reported 13 vulnerabilities (4 moderate, 9 high) across the existing tree. |
| `npm ls drizzle-orm drizzle-kit postgres --depth=0` | Resolved the three packages at the versions above. |
| `npx drizzle-kit --help`, `generate --help`, `migrate --help`, `studio --help` | Confirmed `generate`, `migrate`, `check`, `studio`, `push`, `up`, `introspect` and `export` are supported by 0.31.11. The scripts use only reviewed commands (`export`, `generate`, `check`, `migrate`, `studio`). |
| `npx tsc --noEmit` | Passed with no output. |
| `npm run db:schema` | Passed; printed no SQL because the schema is intentionally empty. |
| `npm run db:generate` | Passed. Loaded `drizzle.config.ts` and the schema barrel, printed `0 tables` and `No schema changes, nothing to migrate`, and created `drizzle/meta/_journal.json`. |
| `npm run db:check` | Passed (`Everything's fine`). |
| `npx tsx -e` with `createDatabase("postgresql://placeholder...")` | Returned a Drizzle handle (`db.select` is a function) and a postgres-js client without opening a connection; `client.end()` completed cleanly. |
| `env -u ADMIN_DATABASE_URL -u DATABASE_URL npm run db:migrate` | Exit code 1 with `Please provide required params for Postgres driver: [x] url: ''`. No connection was attempted, so no database was touched. |
| `npm run lint` | Passed with no output. |
| `rm -f .next/lock && npm run build` | Passed: Next.js 16.4.0 compiled successfully, TypeScript finished, and all 57 static/partial-prerender pages generated. The stale lock from the prior audit was removed first; no Next process was running. |
| Package-lock comparison against `HEAD` | 87 new entries (Drizzle Kit's esbuild/tsx toolchain), 0 removed entries and 0 changed versions. Existing lockfile entries were preserved. |
| `git check-ignore -v .env.example` | `.gitignore:36:!.env.example` — the template is not ignored and appears as an untracked file. |
| Secret-prefix/credential scan of `.env.example`, `src/db/` and `drizzle.config.ts` | Only the public `NEXT_PUBLIC_SUPABASE_*` names and placeholder values were found; no concrete password or service-role key. |
| `npm ls --depth=0` | Resolved all top-level dependencies; the three pre-existing extraneous packages (`@img/sharp-wasm32`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`) remain unchanged. |
| `git status --short` | Modified `.gitignore`, `package.json`, `package-lock.json`; added `.env.example`, `drizzle.config.ts`, `drizzle/` and `src/db/`. No unrelated file was edited. |

### Verified

- TypeScript strict typecheck, ESLint and a clean production build pass.
- Drizzle Kit loads the schema entry point and validates the (empty) migration
  journal without any secret.
- Migration application refuses to run when `ADMIN_DATABASE_URL` is absent; it
  does not fall back to `DATABASE_URL`.
- The app connection module is marked `server-only` and reads `DATABASE_URL`
  lazily; no database credential is exposed through a `NEXT_PUBLIC_` variable.
- Drizzle Studio is bound to `127.0.0.1` so the admin connection is not exposed
  on the local network.
- Staging and production remain separate through environment configuration;
  no SQL was executed against either database.

### Not verified / limitations

- No live Supabase connection, role grant, RLS policy, migration application or
  query was tested. No credentials were supplied for this task.
- No tables existed at Task 1, so the zero-entry journal was expected. Task 2A
  added the foundational tables and Task 3 later generated the initial migration
  plus the applicable `drizzle/manual/security.sql`.
- `db:studio` uses the admin URL. It must be run locally against staging only and
  must never be exposed as a service.
- The prior audit's stale `.next/lock` was removed after confirming no Next
  process was running, and the production build now passes. The build does not
  exercise a database connection because no page imports the DB module yet.
- npm audit reports advisories in the existing dependency tree. No forced audit
  fix was applied because that would change unrelated dependencies.

### Next steps (not started)

1. Implement the exact SRS Section 8 schema in `src/db/schema/*.ts` and
   re-export it from the barrel.
2. Generate and review the first real migration, then apply it to a scratch or
   staging database with `ADMIN_DATABASE_URL`.
3. Add `drizzle/manual/security.sql` (roles, RLS, functions, `pg_cron`) and the
   `SYSTEM` row, then verify on a scratch database.
4. Add seeds, auth/`ActorContext`, and business features only after separate
   approval.

---

# Historical: Database Foundation Readiness Audit

> Superseded by Task 1 above for the database-infrastructure scope. Retained for
> context; the remaining incomplete items are still accurate for schema, auth,
> features and operations.

**Audit date:** 19 Oct 2026
**Scope:** Read-only audit before the SRS Section 8 database-foundation phase. No application code, dependencies, lockfile, database, migrations, or configuration were changed. The current `docs/SRS.md` is the authority.

## Verdict

**Not ready to begin database implementation until the documentation is reconciled, missing required files are added, and a clean production build succeeds.**

The repository is a useful, synthetic-data frontend scaffold, but it has no Drizzle/Supabase/database implementation, migration system, environment contract, CI, or automated test setup. Several older documents claim SRS conformance while materially contradicting the current SRS. The smallest safe correction is to treat the existing UI and DTOs as a prototype, retire or reconcile the stale implementation-spec documents before generating the first migration, and implement the SRS build order from the foundation upward.

## Verified completed work

The following is verified by files and/or commands; it is not a claim of production readiness.

- [x] Next.js App Router scaffold: Next `16.4.0`, React `19.3.0`, TypeScript strict, Tailwind CSS v4, ESLint flat config, and npm lockfile are present.
- [x] Next 16 Cache Components and partial prefetching are enabled in `next.config.ts`; the dynamic router stale time is configured to 30 seconds.
- [x] shadcn configuration exists in `components.json`; reusable controls live in `src/components/ui/` and use Base UI plus Lucide rather than Radix packages.
- [x] Responsive office-shell, auth prototype pages, and feature-page prototypes exist under `src/app/(office)/` and `src/features/`.
- [x] SRS-aligned baseline configuration exists in `src/config/identity.ts`, `src/config/app.ts`, and `src/config/limits.ts`.
- [x] `src/lib/time.ts` centralises basic IST formatting, academic-year calculation, and next-IST-day locking helpers.
- [x] SRS-shaped DTO/type files exist under `src/types/`, including `ActorContext`, permissions, volunteers, events, meetings, hours, requests, audit, and analytics shapes. These are compile-time models only; they are not backed by the database.
- [x] Synthetic fixture accessors exist in `src/lib/mock-data/`; routes use them rather than a database.
- [x] `npx tsc --noEmit` completed successfully on 19 Oct 2026.
- [x] `npm run lint` completed successfully on 19 Oct 2026 with no output after ESLint started.

## Incomplete work

### Database, platform, and security foundation (SRS build step 1)

- [ ] Install and configure the SRS-required database/auth packages: Drizzle ORM + kit, `postgres`, `@supabase/ssr` and the compatible Supabase client.
- [ ] Add the DB client, complete `src/db/schema/*.ts`, generated committed migrations, and the manual security/functions/cron SQL required by SRS Sections 8 and 19.
- [ ] Implement the exact Section 8 schema, seed data, `SYSTEM` row, database roles, RLS, role timeouts, audit purge, permanent-delete function, and all required indexes/constraints. No schema or migration currently exists.
- [ ] Add the SRS environment-variable contract and validation (`DATABASE_URL`, `ADMIN_DATABASE_URL`, Supabase public values, `CRON_SECRET`, `APP_ORIGIN`, `AGE_PUBLIC_KEY`) without exposing server secrets. There is no `.env.example` or environment validation today.
- [ ] Add `seed/staff.template.csv`, ignored `seed/local/`, `scripts/seed.ts`, synthetic-load/data scripts, and the break-glass SQL/runbook material required by Appendix A and Section 19.
- [ ] Provision and record separate staging and production Supabase projects; this cannot be verified from the repository.

### Application foundation after the database (SRS build step 2)

- [ ] Supabase Google authentication, callback, server-side local JWT claim verification, access gate, and sign-out handling.
- [ ] Per-request server-built `ActorContext`, permission union, tiers, emergency packs, SQL-level scope enforcement, and `NOT_FOUND` handling for out-of-scope records.
- [ ] `runAudited()`, no-op detection, idempotency, Postgres-backed limits/cooldowns, and feature/maintenance/read-only gates.
- [ ] Replace mock-data routes and client-only simulated mutations with services/repositories that follow `app -> feature service -> repo -> db`.

### Product features and hardening (SRS build steps 3–8)

- [ ] Implement and test volunteers, roster, requests, events/FCFS/attendance, meetings/MOM, hours/imports, analytics, exports, audit viewer, settings, emergency access, caching, cron/backup, and acceptance/load tests in the prescribed dependency order.
- [ ] Add Vitest + Testing Library, Playwright configuration/specs, SQL constraint tests, bundle-budget checks, and CI. `package.json` has no `test`, typecheck, format, migration, seed, or CI scripts, and no test/config/workflow files were found.
- [ ] Write the missing SRS-required `docs/AUDIT_POLICY.md` and `docs/RUNBOOK.md`; update `README.md` from the create-next-app template once the setup is defined.

## Existing technical debt and failures

1. **No production boundary exists.** There is no database client, Drizzle schema/config/migrations, Supabase package/config, route handler, Server Action, auth gate, RLS, audit transaction, or environment‑variable contract. `src/lib/mock-data/` supplies every inspected feature route. `src/lib/permissions.ts` is a client‑only helper that does **not** enforce server‑side permissions.
2. **The folder architecture does not yet meet SRS Section 16.1.** It has `app`, `config`, `features`, `lib`, `types`, and UI components, but lacks `db`, feature `service.ts`/`repo.ts`/DB schemas, `lib/auth`, `lib/authz`, `lib/audit`, `lib/limits`, `lib/cache`, `lib/platform`, `scripts`, `seed`, and `drizzle`.
3. **Routing is prototype-oriented and differs from the SRS inventory.** The application uses `/dashboard` rather than `/overview`, `/access-denied` rather than `/denied`, has both `/audit` and `/audit-logs`, and uses mock-data `generateStaticParams()` for private volunteer/event/project routes. These routes must become request-authorised and private before release; do not preserve static generation merely because it exists.
4. **The production build is unverified.** The first `npm run build` reached the “Creating an optimized production build …” stage but never terminated cleanly. A second attempt reported “Another next build process is already running”; the stale `.next/lock` file persisted. This indicates a lock‑file leftover that must be cleared before a successful build can be confirmed.
5. **Dependencies do not yet match the SRS foundation.** Required Drizzle, `postgres`‑js, Supabase SSR/client, Vitest, and Testing Library packages are absent. `npm ls --depth=0` also reports three extraneous packages (`@img/sharp-wasm32`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`). Cleanup is postponed until an approved change set (see next tasks). Additionally, `@tanstack/react-query` is installed but never used; the `cn` package is redundant because `src/lib/utils.ts` already uses `clsx` + `tailwind‑merge`.
6. **SRS‑required documentation is incomplete or stale.** `docs/AUDIT_POLICY.md` and `docs/RUNBOOK.md` are **missing** – both are mandatory for the database‑foundation phase. The SRS expects `docs/UI_SPEC.md`; the repository currently contains `docs/UI_SPECS.md`. A decision is required to pick a canonical filename and update references.
7. **Several documents falsely state current-SRS conformance.** See the conflict register below. The previous progress file marked database documentation as exact and many backend-shaped UI features as complete; those statements were not supported by a database implementation and have been superseded by this audit.
8. **Operations are not configured.** No GitHub workflow, Vercel configuration, cron route, backup workflow, environment sample, migration/seed command, or deployment/runbook is present.

## Files that already implement useful portions

| Area | Existing files | Audit assessment |
|---|---|---|
| SRS constants | `src/config/identity.ts`, `src/config/app.ts`, `src/config/limits.ts` | Closely aligned with Appendix C; retain and test against DB/schema validators. |
| Time baseline | `src/lib/time.ts` | Useful start; audit again when implementing exact event-last-day, lock, and database/date behaviour. |
| API DTOs | `src/types/auth.ts`, `project.ts`, `volunteer.ts`, `event.ts`, `hours.ts`, `requests.ts`, `audit.ts`, `analytics.ts` | Useful reference, but some compatibility aliases/prototype fields need an SRS-by-SRS reconciliation before services depend on them. |
| UI foundation | `src/components/ui/`, `src/components/shared/`, `src/components/layout/`, `src/providers/theme-provider.tsx` | Reusable frontend foundation; not security or data foundation. |
| Feature shells | `src/app/(office)/`, `src/features/{volunteers,projects,events,attendance,analytics,audit,team,settings}/` | Prototype routes/components to rewire gradually to authorised server DTOs. |
| Synthetic data | `src/lib/mock-data/` | Valid only for development/demo; must never become production fallback or an authorisation source. |
| App config/tooling | `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json` | Baseline exists; scripts and dependencies require an approved foundation update. |

## SRS conflict register and smallest safe corrections

| Finding | Evidence | Smallest safe correction |
|---|---|---|
| `docs/DATABASE.md` is not the SRS Section 8 schema despite its claim | It defines `event_project_slots`, `request_targets`, enum `audit_action`/`audit_entity_type`, different volunteer constraints, and a `meeting_status` that omits `ONGOING`; the current SRS instead specifies `event_projects`, `approval_requests.target_rolls`, text audit action/entity values, and `ONGOING` for meetings. | Do not generate migrations from this document. Replace/rewrite it from SRS Section 8 during the database task and explicitly mark it as "as built" only after migrations are reviewed. |
| `docs/PERMISSIONS.md` has obsolete soft-rule mapping and permissions | Its S-03 through S-09 meanings differ materially from SRS 3.2 (for example it describes absence/domain-tenure rules not in the current soft-rule list). It also says POC/Builder central-event visibility/permissions more broadly than the SRS. | Replace its matrix and test matrix with an exact transcription of SRS Sections 4–6 before implementing authorisation. |
| `docs/AI_WORKFLOW.md` says the current phase is frontend-only and prohibits production auth/database work | Current SRS Section 22 now directs build step 1 (foundation) and step 2 (auth). | Amend it in the first approved backend documentation change so it defers to SRS build order and removes conflicting phase instructions. |
| `docs/DECISIONS.md` and previous progress contain pre-SRS assumptions | Examples: D-004 schedules auth for "Part 3"; D-013 describes a TanStack v9/mock-data foundation; the prior progress claims exact database documentation. | Keep them as historical records only; the new decision-log entry records that the SRS controls and that contradictions require reconciliation. |
| UI route/document names do not match SRS | `/dashboard`, `/access-denied`, `/audit-logs`, `UI_SPECS.md` versus SRS `/overview`, `/denied`, `/audit`, `UI_SPEC.md`. | Decide one canonical routing/document migration plan before replacing mock data. Use redirects/renames deliberately; do not silently change public/private URLs. |

## Exact next tasks (dependency order)

1. Review and approve this audit; decide on the canonical UI‑spec filename (`UI_SPEC.md` vs `UI_SPECS.md`) and whether prototype route names are renamed or kept with redirects.
2. Reconcile or replace `docs/DATABASE.md`, `docs/PERMISSIONS.md`, and `docs/AI_WORKFLOW.md` from the current SRS; add the missing audit-policy and runbook documents before depending on them operationally.
3. Resolve the stale Next build state **safely** (clear `.next/lock`, ensure no stray dev server processes) and obtain a clean `npm run build` that completes successfully.
4. Approve the exact SRS‑required package set (`drizzle-orm`, `postgres`, `@supabase/ssr`, `vitest`, `@playwright/test`, etc.). Add an `.env.example` with validated variables and update `package.json` scripts (e.g. `seed`, `migrate`, `test`). Commit the lockfile after the approved change.
5. Implement `src/db/schema/*.ts` exactly from SRS Section 8, generate reviewed SQL migrations, and add `drizzle/manual` security/functions/cron SQL plus seed/synthetic scripts.
6. Provision staging and production Supabase projects and apply migrations with the admin connection. Verify roles, RLS, public-key denial, audit immutability, `SYSTEM` row, and the permanent-delete FK coverage test on a scratch database.
7. Implement server auth/access/authorisation, audited mutation primitives, limiter/idempotency, and their table-driven tests before wiring any prototype screen to production data.
8. Convert feature areas in SRS order: volunteers/roster/requests; events/attendance; meetings; hours/imports; analytics/exports/audit/settings/emergency; then caching, jobs/backups, CI, load tests, and the Section 20 acceptance list.

## Commands run and actual results

| Command | Result |
|---|---|
| `git status --short` (before audit) | No tracked or untracked changes reported. |
| `rg --files docs` | Found `SRS.md`, `PERMISSIONS.md`, `DATABASE.md`, `AI_WORKFLOW.md`, `DECISIONS.md`, `PROGRESS.md`, and `UI_SPECS.md`; did **not** find `AUDIT_POLICY.md` or `RUNBOOK.md`. |
| `Get-Content` of `docs/SRS.md` in line chunks | Read the complete 3,422-line current SRS. |
| `Get-Content` of every existing document in `docs/` | Read current documents; noted missing required files and conflicts above. |
| `rg --files ...` for lock/config/test/DB/CI files | Found only `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, and `.gitignore`; no Drizzle, Vitest, Playwright, or GitHub Actions configuration. |
| `rg -n -i "drizzle|supabase|database_url|..." src package.json ...` | No database/auth/env implementation found; feature routes reference `src/lib/mock-data/`. |
| `npm ls --depth=0` | Dependency tree resolved; required database/auth/test dependencies are absent and three packages are reported extraneous. |
| `npx tsc --noEmit` | Passed (completed in 13.7 s). |
| `npm run lint` | Passed (completed in 30.2 s; ESLint produced no warnings/errors). |
| `npm run build` | **Failed:** first attempt stopped at “Creating an optimized production build …” without exiting; second attempt reported an existing Next build process. A stale `.next/lock` file (0 B, last written 19 Oct 2026 14:08:15) remains. |
| `npm run` | Only `dev`, `build`, `start`, and `lint` scripts are available. |
| `git status --short` (before documentation update) | Clean. |

Two read-only inspection commands had PowerShell/regular-expression quoting errors and were immediately re-run successfully; they did not modify the repository.

## Risks requiring a decision

- **Release risk:** absent backend controls; deploying the current prototype would expose private‑record routes without any server‑side guard.
- **Schema risk:** using the stale `docs/DATABASE.md` would create a database incompatible with the authoritative SRS. It must not be used as a migration source.
- **Security/privacy risk:** mock UI permissions, static‑parameter generation, and public‑looking prototype paths are unsafe for production. All private data must be protected by server‑side checks before any deployment.
- **Operational risk:** the production build cannot be verified cleanly; there is no CI pipeline, backup system, cron jobs, or runbook in place.
- **Product decision:** decide if prototype route names (`/dashboard`, `/audit‑logs`, etc.) will be renamed to match the SRS (`/overview`, `/audit`) or kept with redirects. Document the chosen approach.
**Open SRS decisions:** retain SRS Section 21.2 defaults until the NSS board resolves open questions (e.g. hosting‑plan, data‑owner policy Q‑01 & Q‑11). Record any new decisions in `docs/DECISIONS.md`.
