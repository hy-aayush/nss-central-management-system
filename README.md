# NSS SCE KIIT — Central Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase_%E2%80%A2_ap--south--1-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)

> A private, internal **office record-keeping portal** for **NSS (National Service Scheme), SCE KIIT** — one trusted place where Coordinators, the Tech Team, Builders and Project Representatives record volunteers, projects, events, meetings, attendance and service hours.
>
> **Volunteers never log in.** This is not a public site and not a volunteer dashboard. FCFS seat registration happens elsewhere; this portal records the results.

Everything runs on **free tiers only** — Supabase Free (Postgres + Google auth), Vercel Hobby, GitHub Actions — and is built **exactly to the in-repo Software Requirements Specification** ([docs/SRS.md](docs/SRS.md)), which is the single source of truth.

---

## Table of contents

- [What this system does](#what-this-system-does)
- [What this system is NOT](#what-this-system-is-not)
- [Who uses it — roles and access](#who-uses-it--roles-and-access)
- [Tech stack](#tech-stack)
- [Current status](#current-status)
- [Database and schema](#database-and-schema)
- [Security and protection mechanisms](#security-and-protection-mechanisms)
- [Limits, budgets and buffers](#limits-budgets-and-buffers)
- [Storage, retention and backups](#storage-retention-and-backups)
- [Getting started](#getting-started)
- [Repository map](#repository-map)
- [Documentation index](#documentation-index)
- [Roadmap / build order](#roadmap--build-order)
- [Future improvements](#future-improvements)
- [Where the requirements come from](#where-the-requirements-come-from)
- [Contributing and house rules](#contributing-and-house-rules)

---

## What this system does

NSS SCE KIIT runs **9 fixed projects** with about **950 active volunteers** and a large number of events and meetings every year. Today, names, attendance and hours live in chats and spreadsheets. This portal becomes the office's system of record:

| Area | What the portal does |
|---|---|
| **Volunteers** | One record per person: roll number, project, creative domains, gender (compulsory), phone/hostel/blood-group/city (optional, restricted visibility), status lifecycle `ACTIVE ⇄ SUSPENDED → ARCHIVED`, red flags, notes and cached lifetime counters. |
| **Access & roles** | An office roster that doubles as role history — Coordinators, Tech Team (Member/Mentor), Project Representatives (exactly 2 per project) and Builders (General / POC / Domain Lead), granted and revoked per year with audited reasons. |
| **Events** | Central and project events (1–3 projects collaborating), FCFS name entry with slot caps, attendance sheets, early/automatic locking, post-lock corrections with reasons, one-time finalisation that applies counters, and mega events (camps) with special hours rules. |
| **Meetings** | Project, central and builders meetings with agenda, attendance and minutes (MOM, max 100 words). |
| **Hours** | Per-event hours, camp/group rules, tagged manual adjustments, imported legacy hours and a per-volunteer-per-year rollup. |
| **Requests & approvals** | Tech raises suspend / reinstate / archive / permanent-delete / retention requests; Coordinators decide them in one tap, in the same audited transaction. |
| **Imports & exports** | Bounded CSV import of volunteers and of old events/attendance/hours (with dry-run preview and undo), and bounded, column-whitelisted CSV export with spreadsheet-formula protection. |
| **Analytics** | Organisation-wide (Coordinator/Tech) and per-project (PR) dashboards, turnout, hours and a first-class **gender-ratio** view — counts and percentages only, never names. |
| **Audit log** | Every sensitive mutation writes its audit entry **in the same transaction** (`runAudited`). The log is insert-only for the application and is retained for 30 days / 50,000 rows. |
| **Operations** | Settings, feature flags, emergency access packs, a data-quality panel, a daily maintenance job, weekly encrypted backups and rate-limiting on everything. |

### What this system is NOT

- Not a public website, not a volunteer self-service dashboard — volunteers never sign in.
- Not where FCFS registration happens (that runs elsewhere; PRs copy the seated names in).
- No real-time sockets, Redis, microservices, Supabase Storage/Realtime/Edge Functions/Data API, email/password login or volunteer mobile app. Speed comes from caching and a small number of indexed queries, not extra services.

## Who uses it — roles and access

| Role | Who | Reach |
|---|---|---|
| `COORDINATOR` | 4th-year Coordinators (~9) | Highest authority. Full read; the only role that can suspend/archive/permanently delete volunteers and decide requests. |
| `TECH_TEAM` | Tech Members (3rd yr) and Mentors (4th yr) (~6+) | Runs the system; everything except the few powers reserved for Coordinators. Mentors add system settings, feature flags and maintenance. |
| `PROJECT_REPRESENTATIVE` | Exactly 2 per project, 3rd year (18 total) | Scope = own project: volunteers, attendance, FCFS entry, notes (inside an edit budget). |
| `BUILDER` | Builders — `GENERAL`, `POC`, `DOMAIN_LEAD` (3rd year) | Can create central events/meetings. A POC additionally sees name/roll/project in central events and can take central attendance. |

Access rules worth knowing:

- **Google sign-in restricted to `@kiit.ac.in`**. The email's local part **is** the roll number. A person gets a session only if an active volunteer row **and** an active office assignment (or emergency grant) exists — checked on **every server request**.
- **Permissions are the union of all active posts**, ranked in 5 tiers; people may only act on strictly lower tiers (with narrow exceptions), and **nobody may change their own access**.
- **Lockout guards (hard):** the last active Coordinator and the last Tech Mentor can never be removed; a volunteer holding an active post cannot be suspended or deleted until the post ends.
- **Emergency access** hands out narrow, short-lived packs (`EVENT_FCFS`, `MEETING_RUN`, …) tied to one project/event/meeting, capped at 24 hours, never self-granted.
- **Field-level visibility** is enforced by SQL column lists: `BASIC` (roll, name, project) vs `FULL` (everything), so phone, blood group, gender and notes never leak to lower-scope viewers.

The full matrix lives in [docs/PERMISSIONS.md](docs/PERMISSIONS.md) and SRS Section 5.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.4** (App Router) | React Server Components by default; Server Actions for mutations; Route Handlers for exports/cron. |
| UI | **React 19.3**, **Tailwind CSS 4**, **shadcn/ui**, Lucide icons, Motion (light use), Recharts (lazy), TanStack Table, Sonner, next-themes | Responsive, light/dark, keyboard-accessible office UI. |
| Language | **TypeScript** (`strict`, no `any` to bypass errors) | Types mirror the SRS Section 10 domain model. |
| Forms & validation | **Zod 4**, React Hook Form | Zod bounds identical to the DB `CHECK` constraints. |
| Data fetching | TanStack Query | Client cache; server cache per SRS 16.4. |
| Database | **PostgreSQL** on **Supabase Free** (Mumbai, `ap-south-1`) | 500 MB, pooler-only connections, no Data API. |
| ORM | **Drizzle ORM 0.45** + Drizzle Kit, `postgres` (postgres-js) driver | Committed SQL migrations; separate admin vs app connections. |
| Auth | **Supabase Auth — Google provider** (`@supabase/ssr`) | Identity only; all authorization comes from our own tables. JWT verified locally on the server. |
| Hosting | **Vercel Hobby** (Mumbai `bom1` if selectable) | Cloudflare documented as plan B (SRS 2.5). |
| CI / jobs | **GitHub Actions** (private repo) | Lint/typecheck/tests/build, daily maintenance job, weekly backup. |
| Backups | `pg_dump -Fc` → **age** encryption | Public key in repo; private key kept offline. |
| Timezone | `Asia/Kolkata` (IST, UTC+05:30) | Stored in UTC, always displayed in IST; academic year starts 1 July IST. |

Everything is free-tier. There is no paid service anywhere, and adding one requires a decision-log entry first (SRS Section 2 / 21).

## Current status

The project follows the SRS Section 22 build order. **Currently at step 1 (foundation):**

| Step | Description | Status |
|---|---|---|
| 1 | Scaffold, config files, Drizzle setup, **foundational schema + initial migration + manual security SQL** | ✅ Done (`projects`, `volunteers`, `volunteer_domains` + 4 enums) |
| 2 | Auth, access gate, `ActorContext`, permission resolver, tiers, soft rules, `runAudited()`, rate limiter, idempotency | ⬜ Planned |
| 3 | Volunteers (list/profile/create/import), roster, requests inbox, red flags, notes | ⬜ Planned |
| 4 | Events: create, collaboration, FCFS, attendance, lock, finalise, corrections | ⬜ Planned |
| 5 | Meetings: create, run, attendance, MOM, finalise | ⬜ Planned |
| 6 | Hours: categories, groups, approval, recompute, adjustments + old-data import | ⬜ Planned |
| 7 | Analytics, exports, audit viewer, settings, flags, emergency access, data-quality panel | ⬜ Planned |
| 8 | Caching pass, bundle checks, backups, load tests, acceptance list | ⬜ Planned |

What exists today:

- **The complete UI shell and every office screen** (dashboard, volunteers, projects, events, attendance, meetings, hours, analytics, audit, team, requests, settings) — currently driven by **synthetic mock data** in `src/lib/mock-data/`. No real volunteer data is in this repository, by hard rule.
- **All TypeScript domain types** (SRS Section 10) and the **config files** of Appendix C (identity, app, limits).
- **Database infrastructure and the first schema group**, validated against a disposable PostgreSQL 17 instance (see [docs/PROGRESS.md](docs/PROGRESS.md) for the exact test results).
- **Seed + integration-test foundation**: the nine fixed Appendix A.1 projects, an idempotent seed CLI with production guards, optional synthetic fixtures, and a real-PostgreSQL constraint/migration/audit suite (`npm run test:db`).

## Database and schema

PostgreSQL on Supabase, modelled in Drizzle under [`src/db/schema/`](src/db/schema), matching the SRS Section 8 DDL exactly — `snake_case` columns, `timestamptz` for instants, `date` for IST calendar days, Postgres enums, no triggers (`created_at`/`updated_at` are app-managed).

### Implemented — foundational schema group

| Table | Purpose | Key points |
|---|---|---|
| `projects` | The 9 fixed NSS projects (Bandhutva, Dhara, Nidaan, Riddhi, Sanyukt, Sparsh, Swet, Udaan, Urja) | Fixed `smallint` ids 1–9 (not identity — they are business identifiers), unique slug/name, SDG number array, `last_activity_at` for the derived “status”. |
| `volunteers` | One row per person — the backbone table | `roll_number` as text primary key (DB check deliberately loose; the real pattern lives in `src/config/identity.ts`), 7 `CHECK` constraints, mandatory gender, cached counters (`events_attended`, `meetings_present`, `allocated_hours`, `red_flag_count`, …), `fillfactor = 85` so frequent counter updates stay in-place. |
| `volunteer_domains` | A volunteer's creative specialisations (Photography, Video Editing, Graphic Designing, Content Writing) | Composite PK `(roll_number, domain)`; “General Volunteering” is implicit and never stored. |

3 foreign keys (all `ON DELETE RESTRICT` — permanent removal goes through a dedicated DB function, never a cascade), 3 indexes, 4 enums (`gender`, `volunteer_status`, `blood_group`, `creative_domain`).

### Planned — remaining SRS Section 8 groups

`office_assignments` (roster + PR-slot uniqueness enforced by partial unique indexes), `red_flags`, `approval_requests`, `import_batches`, `event_categories`, `event_groups`, `events`, `event_projects`, `event_participants`, `meetings`, `meeting_attendance`, `attendance_corrections`, `hours_adjustments`, `volunteer_year_hours`, `emergency_grants`, `audit_log`, `settings`, `rate_limits`, `idempotency_keys` — plus 17 more enums (21 in total). Derived values are never stored: `year`, `email`, project status and `ONGOING` event state are all computed.

<details>
<summary><b>Notable schema design decisions</b> (click to expand)</summary>

- **Counters on `volunteers` are cached** (events attended, FCFS outcomes, meetings, hours, red flags) so list pages and analytics never scan the big attendance tables. They change **only** inside the named TypeScript feature functions (SRS 11.10) — never via ad-hoc `UPDATE`.
- **`year` and `email` are computed, not stored** — the academic year flips on 1 July IST.
- **Meetings store present-only attendance rows**; absence is derived and counted.
- **The `SYSTEM` pseudo-volunteer** stands in for imported/removed records; it is hidden from every list, count, chart and export.
- **Everything is `ON DELETE RESTRICT`** toward `volunteers`: a person is removed only by `delete_volunteer_permanently()`, which must handle every FK to `volunteers` (a test reads `pg_constraint` to enforce this when those tables land).

</details>

### Migrations and database privileges

The SRS requires a strict split between **application access** and **administrative migration privileges**:

| Connection | Role | Used by | Purpose |
|---|---|---|---|
| `DATABASE_URL` | `app_user` (least privilege, pooler port 6543) | the Next.js runtime | DML only — no DDL, no audit mutation, RLS applied. |
| `ADMIN_DATABASE_URL` | Supabase `postgres` (session mode, port 5432) | Drizzle migrations, seeds, backups, CI only | The only thing allowed to change schema. Never set in Vercel. |

- Migrations are **committed SQL** generated by `drizzle-kit generate` ([`drizzle/0000_moaning_ricochet.sql`](drizzle/0000_moaning_ricochet.sql)) — reviewed by hand, applied with `npm run db:migrate`, **never from the app**, never against production without review.
- Manually maintained SRS SQL lives in [`drizzle/manual/`](drizzle/manual) — currently [`security.sql`](drizzle/manual/security.sql): the `app_user` role, least-privilege grants, RLS on every public table, revocation from Supabase's `anon`/`authenticated` API roles, role timeouts, and the `SYSTEM` row. Deferred blocks (the `audit_log` purge and permanent-delete functions) are documented in [`drizzle/manual/README.md`](drizzle/manual/README.md) and land together with the tables they depend on.

## Security and protection mechanisms

Security is layered — from the browser down to the database:

1. **Deny by default.** Every request builds an `ActorContext` from the database on the server; the client is never trusted for role, scope or IDs. Anything not explicitly permitted in the permission matrix is denied, and out-of-scope resources return `NOT_FOUND` (not `FORBIDDEN`) so their existence is not leaked.
2. **Scope inside SQL.** Project scope is enforced in the `WHERE` clause, and field visibility (BASIC vs FULL) is enforced by explicit column lists — never by hiding things in the UI.
3. **Authentication.** Google OAuth restricted to `@kiit.ac.in`, `email_verified` required; the JWT is verified **locally** on the server (no per-request network call); no role is ever read from the token; sign-out sends `Clear-Site-Data` so the back button cannot show private pages.
4. **Least-privilege database roles + RLS.** The app connects as `app_user`, which cannot create/alter tables, **cannot update or delete `audit_log`**, and is the only role with Row-Level-Security policies; `anon`/`authenticated` (the public Supabase API keys) have **zero** access and Supabase's Data API is unused and locked. Role timeouts (`statement_timeout` 8 s, `lock_timeout` 3 s) stop a slow query from hurting everyone.
5. **Transaction-safe auditing.** Every sensitive mutation runs through `runAudited()`: the business write and the audit insert share **one transaction** — if the audit fails, the write rolls back. The audit log is insert-only for the app; only table-owner functions (`purge_audit_log()`, the future `delete_volunteer_permanently()`) may touch old rows, on a schedule (`pg_cron`), never through the app.
6. **Requests, not raw power.** Tech cannot suspend/archive/delete volunteers — Coordinator approval is required, decided in the same audited transaction, with typed confirmation for permanent deletes and automatic expiry.
7. **Abuse protection (SRS 17).** A per-person Postgres-backed rate limiter (shared across serverless instances) covers reads, writes, bulk actions, imports, exports and denied logins; plus idempotency keys, no-op detection, size caps, edit budgets, a Vercel edge rule (600 req/min/IP), and breakers (strict mode, read-only mode, maintenance mode). Coordinators/Tech get 3× limits and are never cooldown-blocked.
8. **CSV hardening.** Export: server-side authorization, hard row caps, per-role column whitelist (notes and red-flag reporters are never exportable), UTF-8 BOM, and a formula-injection guard (`=`, `+`, `-`, `@` cells are neutralised). Import: Zod-validated, two-step dry-run → confirm with a short-lived token, one transaction, row contents never logged.
9. **Caching privacy.** The shared server cache holds **counts and IDs only** — never `ActorContext`, permissions, notes or anything keyed by a person; private pages always send `Cache-Control: private, no-store`.
10. **Secrets and headers.** All secrets live in Vercel/GitHub secret stores (no service-role key exists in the app at all); responses carry CSP, `X-Content-Type-Options: nosniff`, strict referrer policy, `frame-ancestors 'none'` and a Permissions-Policy that disables camera/microphone/geolocation; cookies are `Secure`, `HttpOnly`, `SameSite=Lax`; all queries are parameterised through Drizzle.
11. **Privacy by policy.** Development and staging use synthetic data only; real personal data never enters the repo, logs, screenshots or prompts. The delete flow (SRS 11.13) and retention rules (11.14) are the technical answer to data-erasure requests, and the institute's policy plus India's **DPDP Act 2023** must be reviewed before launch.

## Limits, budgets and buffers

The system is designed for its actual scale — **not** for millions of rows — and deliberately runs well inside every free-tier quota.

### Design scale

| Item | Number |
|---|---|
| Active volunteers | ~950 (≈315 each in 2nd/3rd/4th year, ≈105 per project) |
| Volunteer rows incl. archived | up to ~1,700 |
| Projects / PRs / office users | 9 fixed / 18 / ~100 max |
| Meetings per month | ~200 (180 project + 20 central/builders) |
| Events per month | ~25 (18 project + 7 central) |
| Busiest moment | 18 PRs entering FCFS names in ~60 min; ~20 people marking attendance on event day |

### Free-tier budgets and the buffer we keep

| Quota | Free limit | Our target | Buffer |
|---|---|---|---|
| Database size | 500 MB | ≈140–170 MB at year 3.5 (~25–35 MB/year growth) | **~3× safety margin** |
| Vercel invocations | 1,000,000/month | ≤400,000 | ~60% headroom |
| Vercel CPU | 4 active hours/month | ≤1.6 hours; ≤40 ms avg CPU/request | ~60% headroom |
| DB size guard rails | — | 350 MB → warning, 425 MB → automatic read-only mode + alert | act before the hard stop |
| Audit log | 30 days | 30 days **and** ≤50,000 rows, whichever is smaller | bounded by both |
| Query budget | — | ≤1 query to resolve the actor; 2–3 per page; set-based bulk statements only (no per-row loops) | few, indexed, parallel |

### Request limits (defaults, per person)

Reads 120/min · writes 30/min and 1,000/day · bulk actions 10/min · CSV export 1 at a time, 3/hour, 10/day, ≤2,000 rows · CSV import 3/day, ≤1,000 rows, 1 MB · event/meeting creation 20/day · heavy jobs 1 per 5 minutes globally · audit rows 1,000/day · table page size 50 · edit budget 2 saved changes after first save. Coordinator/Tech get 3× on read/write/bulk and no cooldown. Three trips in 10 minutes start a 5-minute cooldown. All numbers live in [`src/config/limits.ts`](src/config/limits.ts) and are overridable from Settings.

The database side of abuse protection: `app_user` gets `statement_timeout = 8s`, `lock_timeout = 3s`, `idle_in_transaction_session_timeout = 10s`; FCFS slot rows are serialised with `SELECT … FOR UPDATE`; finalise/retention/recompute use advisory locks and are idempotent.

## Storage, retention and backups

**Where data lives.** One Supabase Free project per environment (production + staging — the two free projects, no third), region Mumbai `ap-south-1`. No object storage: CSV files are streamed and never persisted server-side. Expected total DB size at year 3.5 is **≈140–170 MB of the 500 MB** (app data ≈110–140 MB, Supabase system schemas ≈10–30 MB). The database-size check runs in the daily job and is shown on the Settings page.

**How long data is kept:**

| Data | Retention |
|---|---|
| Events, participants, meetings, attendance | 42 months (default `retention_months`, range 24–120), purged only when the academic year is final, in chunks of 100 per transaction |
| Audit log | 30 days **and** 50,000 rows (whichever first); purged by `pg_cron` as the table owner |
| Decided approval requests | 90 days |
| Rate-limit and idempotency rows | 1 day (daily job) |
| Corrections, adjustments, year-hours, red flags, import batches | kept indefinitely (tiny tables) |
| Volunteers | never auto-deleted — archive/delete are explicit Coordinator decisions |

**Backups** (Supabase Free has **no automatic backups**, so this is the only safety net): weekly `pg_dump -Fc` through the session-mode pooler via GitHub Actions, encrypted with **age** (public key in the repo, private key kept offline by the Tech lead and a Coordinator), keeping the last 4 weekly + 1 monthly copies. Restore tests run at least once per term into local Docker Postgres; a manual backup is taken before any risky operation (retention runs, history imports, bulk deletes). Note: deleted volunteers remain in old backups until they rotate out (~5 weeks).

## Getting started

Prerequisites: **Node.js 20+**, npm, and (only for database work) a Supabase project or a local PostgreSQL with the roles described in [drizzle/manual/README.md](drizzle/manual/README.md).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# fill in DATABASE_URL / ADMIN_DATABASE_URL etc. — never commit .env

# 3. Run the development server
npm run dev
# → http://localhost:3000
```

The UI runs fully on synthetic mock data at this stage — no database is required to browse it. Database integration tests need a disposable local PostgreSQL; the exact command, seed/migration commands and verified results are in [docs/DATABASE.md](docs/DATABASE.md) §7–8.

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Standard Next.js development server, production build and server. |
| `npm run lint` | ESLint. |
| `npm run db:generate` | Diff `src/db/schema/index.ts` against committed migrations and write new SQL (no connection needed). |
| `npm run db:check` | Validate the migration journal and SQL files (no connection needed). |
| `npm run db:migrate` | Apply committed migrations using `ADMIN_DATABASE_URL` (admin connection only). |
| `npm run db:schema` | Export the current schema SQL (no connection needed). |
| `npm run db:security` | Apply the repeatable `drizzle/manual/security.sql` with `ADMIN_DATABASE_URL`. |
| `npm run db:seed` | Seed the nine fixed projects from Appendix A.1. Dry run by default; add `--apply` to write, `--fixtures` for synthetic dev/test volunteers. Refuses a production target. |
| `npm run test:db` | Real-PostgreSQL integration tests against `TEST_ADMIN_DATABASE_URL` (see [docs/DATABASE.md](docs/DATABASE.md) for the disposable Docker command). |
| `npm run db:studio` | Drizzle Studio — inspect the database (use against staging locally). |

## Repository map

```
nss-central-management-system/
├── docs/                      # The spec and every supporting doc (see Documentation index)
│   └── SRS.md                 #   ★ Source of truth — 3,400+ line software requirements spec
├── drizzle/
│   ├── 0000_moaning_ricochet.sql  # Initial migration: 4 enums, 3 tables, FKs, indexes, fillfactor
│   ├── meta/                      # Drizzle migration snapshot + journal
│   └── manual/                    # Hand-maintained SRS SQL, applied after migrations by the admin role
│       ├── security.sql           #   app_user role, grants, RLS, timeouts, SYSTEM row
│       └── README.md              #   apply order, deferred blocks, local-validation steps
├── drizzle.config.ts          # Drizzle Kit config — reads only ADMIN_DATABASE_URL (never DATABASE_URL)
├── src/
│   ├── app/                   # Next.js App Router routes (RSC by default)
│   │   ├── (auth)/            #   login, access-denied
│   │   ├── (office)/          #   dashboard, volunteers, projects, events, meetings, attendance,
│   │   │                      #   hours, analytics, audit, team, requests, settings
│   │   └── api/               #   cron + export route handlers (planned)
│   ├── components/            # Shared UI: charts, dashboard, layout, shared, shadcn/ui primitives
│   ├── config/                # ★ Appendix C config: identity.ts (roll pattern, email domain),
│   │                          #   app.ts (IST, academic year, page sizes), limits.ts (all rate limits)
│   ├── db/
│   │   ├── schema/            # Drizzle schema = SRS Section 8 (enums, projects, volunteers, domains)
│   │   ├── seed/              #   Appendix A.1 reference data, optional synthetic fixtures, guards
│   │   ├── index.ts           #   server-only typed connection (app_user)
│   │   └── client.ts          #   postgres-js client: prepare:false, max:1 (pooler-friendly)
│   ├── features/<feature>/    # Feature UI per SRS 16.1 (volunteers, events, attendance, analytics,
│   │                          #   audit, projects, team, settings, dashboard) — service/repo layers coming
│   ├── hooks/                 # Client hooks (e.g. use-mobile)
│   ├── lib/
│   │   ├── mock-data/         # ★ Synthetic fixtures driving the current UI — fake data only
│   │   ├── time.ts            #   IST day-boundary / academic-year helpers (the only source of truth)
│   │   ├── navigation.ts      #   role-aware sidebar items
│   │   ├── constants.ts       #   UI constants aligned with the SRS/UI spec
│   │   └── utils.ts
│   ├── providers/             # Theme provider (next-themes)
│   └── types/                 # ★ SRS Section 10 domain types: auth, project, volunteer, event, hours,
│                              #   requests, audit, analytics, index
├── scripts/                   # seed.ts, apply-security.ts and their shared helpers
├── tests/db/                  # Real-PostgreSQL integration tests + scratch-database harness
├── public/                    # Static assets (icons; no image optimisation by design)
├── components.json            # shadcn/ui configuration
├── next.config.ts, tsconfig.json, eslint.config.mjs
├── package.json               # scripts + pinned dependencies
└── .env.example               # Environment template with safety comments (copy to .env)
```

★ = start here if you are new. Dependency direction is strict: `app → features/*/service → features/*/repo → db`. UI never imports the repo or db layers; Client Components receive plain DTOs only.

## Documentation index

| File | Contents |
|---|---|
| [docs/SRS.md](docs/SRS.md) | **The Software Requirements Specification** — schema DDL, permission matrix, business rules, workflows, limits, architecture, testing and acceptance. Source of truth. |
| [docs/PERMISSIONS.md](docs/PERMISSIONS.md) | Section 5 as a reference table plus the permission-test matrix. |
| [docs/DATABASE.md](docs/DATABASE.md) | The schema as actually built, migration commands, index notes, validation results, measurements. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Dated architectural decision log (the “why”). |
| [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) | The rules AI agents building this repo must follow. |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Phase-by-phase status, commands run, validation results, next steps. |
| [docs/UI_SPECS.md](docs/UI_SPECS.md) | Design tokens, navigation, component and responsive specs. |
| [drizzle/manual/README.md](drizzle/manual/README.md) | How to apply the manual SQL, and why some SRS blocks are deferred. |

## Roadmap / build order

Per SRS Section 22, work proceeds in eight steps (foundation → auth/authorization → volunteers/roster → events → meetings → hours/imports → analytics/exports/settings → hardening/load tests). The exact phase status is tracked in [docs/PROGRESS.md](docs/PROGRESS.md). Key upcoming milestones:

1. **Schema groups 2+** — `office_assignments` (with the two-PR-slots-per-project unique index), red flags, approval requests, import batches.
2. **Auth + authorization core** — access gate, `ActorContext`, permission resolver, tiers, soft rules, `runAudited()`, the Postgres rate limiter and idempotency; verified by a table-driven test of the entire permission matrix.
3. **Business features** — events/FCFS/attendance/finalise, meetings/MOM, hours, imports — each with counters changed only inside the named functions.
4. **Deferred database functions** — `audit_log` + `purge_audit_log()` (with `pg_cron`) and `delete_volunteer_permanently()` (which must handle every FK to `volunteers`; a constraint test enforces this), landing together with their dependency tables.
5. **Operations** — seed scripts, daily/weekly GitHub Actions, encrypted backups + restore tests, keep-alive for the Supabase 7-day idle pause.

## Future improvements

Ideas and known gaps beyond the immediate roadmap:

- **Hosting plan B — Cloudflare.** Documented in SRS 2.5: potentially a larger free request allowance, edge delivery and free firewall rules without Vercel's pause-on-quota risk. Hosting-specific code is isolated in `src/lib/platform/` so a move is a few files, not a rewrite. (A first Cloudflare deployment attempt caused problems; Vercel runs v1.)
- **CI pipeline.** Wire lint, typecheck, unit tests, Playwright e2e/authorization tests, the SQL constraint suite and a bundle-budget check into GitHub Actions so every PR is verified automatically.
- **Test coverage for the later schema groups.** The real-PostgreSQL harness now covers migrations, constraints, seeds and audit immutability for the foundational schema; `office_assignments` integrity, the SRS 11.10 counter functions and the real `audit_log` remain `it.todo` until their tables land.
- **Full caching pass + performance measurement.** Implement the C2 shared-aggregate cache, measure real CPU per route with a scripted “busy day” in staging, and record the numbers in docs/DATABASE.md before launch.
- **Restore drills and monitoring hardening.** Automated quarterly restore tests, uptime checks on the keep-alive job, and alerting when any free-tier quota passes 60% mid-month.
- **Yearly re-verification of free-tier limits.** Vercel/Supabase/GitHub quotas change; the SRS says re-check the vendor docs every year and update `src/config/limits.ts` in the same PR.
- **Institutional review.** Data ownership, retention and erasure under India's DPDP Act 2023 and the institute's own policy, agreed with NSS SCE KIIT before real data is imported.
- **Ergonomics for the office.** Print sheets for event days (paper fallback during outages), richer data-quality hints, and optional `audit_staff_csv` logging if the team ever wants a trace of staff CSV downloads.
- **Account ownership & handover.** Move GitHub/Vercel/Supabase ownership to a dedicated NSS tech account with 2-step verification so no system depends on one student's personal account.

## Where the requirements come from

This portal was not designed ad-hoc. Its behaviour is derived from:

- **[docs/SRS.md](docs/SRS.md)** — a 3,400+ line, agent-buildable specification written for this project: hard rules vs overridable soft rules, the exact Postgres DDL, the permission matrix, business workflows (FCFS, finalise, corrections, retention), caching tiers, rate limits, the full acceptance-test list, and the decision log. Where code and the SRS disagree, one is fixed in the same PR.
- **Vendor documentation** — Vercel limits/plans/firewall docs, Supabase pricing and connection docs, GitHub Actions billing docs (checked October 2026; re-verified yearly).
- **Institutional context** — how NSS SCE KIIT actually runs: 9 projects, 2 PRs per project, yearly rotation, FCFS handled externally, recruitment in August/September, academic year starting 1 July IST.
- **Statutory context** — India's Digital Personal Data Protection Act, 2023, as the basis for the retention, deletion and access rules (formal institutional review pending before launch).

## Contributing and house rules

- Read [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) and SRS Section 3 before changing anything; `docs/SRS.md` wins every conflict.
- **Never commit** real volunteer data, `.env` files, filled seed files (`seed/local/`), credentials or the Supabase service-role key (the app must never hold one).
- No table, column, enum, package, role, permission, setting or feature may be added that the SRS does not authorise — update the SRS and `docs/DECISIONS.md` in the same PR.
- Database changes go through committed migrations + reviewed manual SQL, applied with the **admin** connection only — never from the application, never destructively against production.
- Development/staging run on synthetic data only (see `scripts/synthetic-data` plans in the SRS).
- AI-generated work is reviewed and tested for stray files and dependency changes before merge.

---

<p align="center">
  <sub>NSS SCE KIIT — Central Management System · Internal office portal · Built to <code>docs/SRS.md</code> · Runs entirely on free tiers</sub>
</p>
