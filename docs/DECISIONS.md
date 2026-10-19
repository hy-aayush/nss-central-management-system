# Architecture Decision Log

## D-001: Application architecture

Decision: Next.js App Router with TypeScript.
Reason: Shared frontend and server-side application in one repository.

## D-002: Database ORM

Decision: Drizzle ORM with Supabase PostgreSQL.
Reason: Explicit SQL control, typed schema and transactions.

## D-003: Frontend-first development

Decision: Synthetic mock data during Part 1.
Reason: Complete and review the UI before backend integration.

## D-004: Authorization

Decision: Server-enforced permissions in Part 3.
Reason: Client-side restrictions cannot secure private records.

## D-005: Rendering strategy

Decision: Server Components by default.
Reason: Reduce client JavaScript and unnecessary data fetching.

## D-006: Design Token Architecture and OKLCH Color Space

Decision: Implement a strict design token architecture in `src/app/globals.css` using Tailwind CSS v4 `@theme inline` and modern OKLCH color spaces.
Reason: OKLCH provides perceptually uniform color shades, reliable WCAG AAA/AA contrast in both light and dark modes, high-density neutral surfaces, a single authoritative indigo accent, and clear operational status colours (Success, Warning, Error, Info).

## D-007: Font Strategy via next/font

Decision: Configure Inter and JetBrains Mono via `next/font/google` with CSS variables (`--font-sans` and `--font-mono`) and OS system font fallback stacks.
Reason: Guarantees zero layout shift (CLS 0), build-time self-hosting (no third-party external requests at runtime), and aligns directly with SRS section 9.

## D-008: Client Theme Synchronization

Decision: Wrap application in `next-themes` ThemeProvider with `attribute="class"`, `defaultTheme="system"`, and `enableSystem`. Utilize React 19 `useSyncExternalStore` in client toggles.
Reason: Eliminates theme flickering, respects OS system preferences, and avoids `useEffect` `setState` cascade warnings under React 19.

## D-009: App Router Cleanup for API and Route Groups

Decision: Remove erroneous empty App Router UI files from `src/app/api/` (`error.tsx`, `layout.tsx`, `page.tsx`, `globals.css`) and redundant `src/app/(office)/globals.css`.
Reason: In Next.js App Router, `src/app/api` is reserved for Route Handlers (`route.ts`). Root UI layout and globals belong at `src/app/`.

## D-010: Standardized Class Merging Utility

Decision: Update `src/lib/utils.ts` to export standard `clsx` + `tailwind-merge` implementation.
Reason: Eliminates reliance on the duplicate `"cn"` npm package while providing full compatibility for all shadcn/ui components.

## D-011: Suspense Boundaries in Application Shell for Partial Prerendering (PPR)

Decision: Wrap client shell navigation components (`AppSidebar`, `Topbar`, `MobileNav`) within `<Suspense>` boundaries inside `src/app/(office)/layout.tsx`.
Reason: In Next.js App Router (especially with dynamic segments and PPR enabled), components invoking `usePathname()` or `useSearchParams()` during static compilation will de-opt prerendering if not guarded by a Suspense fallback. The lightweight skeleton fallbacks preserve fast static shell delivery and enable flawless static generation for all nested routes.

## D-012: Centralized Navigation Registry and Canonical Domain Typings

Decision: Define all navigation items, route paths, badges, and breadcrumb resolvers centrally in `src/lib/navigation.ts`, and define all core domain types (`auth.ts`, `project.ts`, `volunteer.ts`, `event.ts`) in `src/types/` matching SRS sections 2, 7, 8, and 14.
Reason: Prevents code duplication across desktop sidebar, mobile navigation, and breadcrumbs. Establishes a single source of truth for the 9 designated projects, creative domains, office roles, and volunteer attendance entities ahead of subsequent feature-page development.

## D-013: Headless TanStack Table v9 Foundation & Mock Data Access Layer

Decision: Implement the reusable `DataTable` foundation in `src/components/shared/data-table.tsx` using `@tanstack/react-table` v9 with `stockFeatures`, and expose mock datasets via typed query functions (`getVolunteers`, `getProjects`, `getEvents`, etc.) in `src/lib/mock-data/index.ts`.
Reason: TanStack Table v9's feature-driven architecture eliminates unnecessary re-renders via reactive store slices while enabling sorting, filtering, and row selection. Abstracting mock data behind functional accessors avoids embedding giant static arrays in page components, ensuring seamless transition to server actions/database queries in later phases.

## D-014: Universal Volunteer Hierarchy, SDG-Linked Projects & FCFS Turnout Mechanics

Decision:
1. Universal Volunteer Model: Every individual across the organization is stored as a `Volunteer` with natural primary key `rollNumber` and institutional email `<rollNumber>@kiit.ac.in`. Elevated office roles (`COORDINATOR`, `TECH_TEAM`, `BUILDER`, `PROJECT_REPRESENTATIVE`) wrap volunteer identities via an annual rotating post system (`User.details`).
2. Dual Project Representatives: Each project is led by exactly two (2) 3rd-year volunteers (`projectRepresentative1`, `projectRepresentative2`) with equal authority rotating annually.
3. UN SDG Project Framework: All 9 projects are permanently mapped to specific UN Sustainable Development Goals; all organized events must align with the project's allotted SDGs.
4. FCFS Registration & Turnout Lifecycle: High-demand events utilize First-Come-First-Serve registrations. Volunteers who sign up via FCFS but fail to attend without valid excuse are recorded in `EventsMissedAfterFcfs` for priority scoring and penalty calculation. Attendance percentages are bifurcated into `attendanceRateMeetings` and `attendanceRateEvents`.
5. Data Privacy Boundaries: In Central Events, POCs and Builders can only see `rollNumber`, `name`, and `project` of attendees with all personal contact data masked. Coordinators and Tech Team retain global access with checkbox-selectable parameter Excel/CSV exports.
6. 3.5-Year Event Archival & Annual Hours Rollup: Event records are preserved for 3.5 years; service hours are finalized at the end of the academic year by Tech Team / Coordinators, triggering automatic rollup calculation.
7. Tri-Partite Meetings Lifecycle: Formal tracking for `PROJECT MEETING` (project volunteers only), `CENTRAL MEETING` (all volunteers), and `BUILDERS MEETING` (active builders only) with Minutes of Meeting (MOM) and roll-number attendee registers.

Reason:
Faithfully reflects actual institutional practices at KIIT, guarantees rigorous data privacy boundaries, enforces accountability in high-demand event attendance, prevents schema duplication, and establishes clean compliance with UN SDG frameworks.

## D-015: Frontend Review Corrections and Client Route Reuse

Decision:
1. Keep this phase explicitly synthetic; replace identity-like coordinator fixtures with a conspicuously synthetic demo identity.
2. Use the Next.js client router cache for dynamic page segments for 30 seconds, as specified by the SRS. Do not introduce shared server caching for private records; future server reads must follow the SRS authorization and cache boundaries.
3. Present unimplemented meeting, hours, and request actions as unavailable prototype workflows rather than misleading no-op controls.

Reason:
Improves prototype privacy and honesty, reduces repeat client navigation work, and avoids caching sensitive records across users. The current UI reads local fixture modules and makes no Supabase calls, so this setting does not yet reduce database usage.

## D-016: Authoritative SRS and database-foundation audit baseline (19 Oct 2026)

Decision: `docs/SRS.md` is authoritative for all future implementation. Existing frontend-era planning documents and prototype decisions remain historical context only where they agree with the SRS; they must not supply database, authorisation, or operational requirements when they conflict with it.

Reason: The pre-database audit found material contradictions in `docs/DATABASE.md`, `docs/PERMISSIONS.md`, `docs/AI_WORKFLOW.md`, and prior progress reporting. In particular, no current Drizzle/Supabase schema, migration, auth, RLS, audit, or environment implementation exists. The next approved work must reconcile the documentation before generating migrations, following SRS Section 22's dependency order.



## D-017: Documentation Reconciliation & Backend Foundation Approval

**Decision (19 Oct 2026):**  

The repository is **not** ready for the SRS Section 8 database‑foundation phase until the following items are resolved and committed:

1. **Create the missing mandatory documents**  
   - `docs/AUDIT_POLICY.md` – full audit‑log retention, access, and sanitisation policy.  
   - `docs/RUNBOOK.md` – emergency‑access break‑glass procedures, restore‑access SQL, and backup‑restore workflow.  
   - `docs/UI_SPEC.md` (or rename the existing `UI_SPECS.md`) – a single source of truth for route names, page titles, and component layout that matches the SRS.

2. **Resolve the UI‑spec filename conflict** – choose either `UI_SPEC.md` (preferred) or keep `UI_SPECS.md`. The chosen filename must be referenced consistently in all documentation, routing comments, and future PR templates.

3. **Clear the stale Next.js lock** – run `rm -f .next/lock` (or the Windows equivalent) after ensuring no dev server is running, then re‑run `npm run build` to verify a clean production build. Record the successful build output in this decision log.

4. **Approve the exact SRS‑required package set** – add the following dependencies (and their typings) to `package.json`:
   - `drizzle-orm`, `drizzle-kit`  
   - `postgres` (or `postgres-js`)  
   - `@supabase/ssr`, `@supabase/auth-helpers-nextjs`  
   - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`  
   - `@playwright/test`  
   - (Optional but recommended) `dotenv-cli` for environment validation.
   After adding, run `npm install` and verify that `npm ls --depth=0` shows **no** extraneous packages.

5. **Add an `.env.example`** that lists all required variables (`DATABASE_URL`, `ADMIN_DATABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN`, `CRON_SECRET`, `AGE_PUBLIC_KEY`) with placeholder values and a short description.

6. **Record the approved next‑step order** in this decision file (see D‑017‑1 through D‑017‑6). Future work must follow this exact order; any deviation requires a new decision entry.

7. **Rationale:**  
The audit (see `docs/PROGRESS.md`) uncovered critical gaps (missing docs, stale build lock, absent database tooling, and inconsistent route naming). Proceeding without addressing these would break the SRS‑defined build order, introduce security/privacy regressions, and hinder reproducible CI/CD pipelines.

**Impact:**  
- Guarantees that the first database migration is generated from the authoritative SRS schema.  
- Provides a documented emergency‑access workflow required for production.  
- Aligns UI routing with the SRS, simplifying later refactors.  
- Clears the path for CI/CD integration and reliable production builds.

**Status:** Pending approval by the Coordinator and Tech Mentor leads. Once approved, the items above will be implemented as a single change set (PR # XXX) before any backend code is added.

---

## D-018: Future Backend‑Foundation Milestones (post‑approval)

* After D‑017 is approved and merged, the next PR will:
  - Add the Drizzle schema (`src/db/schema/*.ts`) matching SRS Section 8.  
  - Generate the first migration with `drizzle-kit`.  
  - Add the Supabase auth guard (`src/lib/auth/*`) and `ActorContext` builder.  
  - Introduce `runAudited()` and `checkSoftRule()` utilities.  
  - Wire the first feature (Volunteer roster) to the DB.  

* Subsequent PRs will follow the ordered feature roadmap defined in `docs/PROGRESS.md` (volunteers → requests → events → meetings → hours → analytics → audit → settings → emergency → cron/backup → CI).

---

## D-019: Database infrastructure baseline (19 Oct 2026)

**Decision:** Use Drizzle ORM `0.45.4` with the `postgres` (postgres-js)
`3.4.9` driver, managed by `drizzle-kit` `0.31.11`, as the only database
foundation.

- The application connects through the Supabase Supavisor **transaction**
  pooler on port 6543 with `prepare: false`, `max: 1`, a 20-second idle timeout
  and a 10-second connect timeout.
- `src/db/index.ts` is marked `server-only`; it reads `DATABASE_URL` lazily and
  caches one handle per serverless instance on `globalThis`.
- `src/db/client.ts` is a pure factory that accepts an explicit URL so scripts
  and tests can target staging or local Postgres without loading app secrets.
- Drizzle Kit reads only `ADMIN_DATABASE_URL`. Migrations never use the runtime
  `app_user` credential, and there is intentionally no `db:push` script.
- `db:schema` (`drizzle-kit export`) previews schema SQL without a database;
  `db:generate` produces reviewed migration files.
- Drizzle Studio is bound to `127.0.0.1` so the admin connection is not exposed
  on the local network.
- `src/db/schema/index.ts` is the single schema barrel. At the time of D-019 it
  exported no tables; Task 2A adds the foundational group in D-020.
- No database credentials are exposed with `NEXT_PUBLIC_`; `.env.example`
  contains placeholders only and is explicitly un-ignored for review.

**Reason:** The SRS requires the transaction pooler configuration, server-only
credentials, committed migrations and exact environment names. A lazy,
server-only handle keeps builds usable without secrets and prevents accidental
client imports, while a single admin-only migration URL prevents DDL from
running as the least-privilege application role.

**Status:** Infrastructure validated with typecheck, lint, schema loading and
migration-journal checks. A live database connection remains unverified. The
foundational schema group is now implemented under D-020; later groups remain
unimplemented.

---

## D-020: Foundational schema boundaries and fillfactor handling (19 Oct 2026)

**Decision:** Implement only the first SRS Section 8 dependency group in
`src/db/schema/`:

- `enums.ts` — only the four enums needed by this group: `gender`,
  `volunteer_status`, `blood_group`, `creative_domain`.
- `projects.ts` — SRS 8.2 `projects`.
- `volunteers.ts` — SRS 8.2 `volunteers`, including the stored counters but not
  derived email/year/rates/status.
- `volunteer-domains.ts` — SRS 8.2 `volunteer_domains`.
- `index.ts` — the single barrel; every schema file must be re-exported.

No migration was generated during Task 2A; Task 3 generated it after the
group was reviewed.

**Constraint naming:** SRS 8.2 declares the seven `volunteers` checks inline
without names. PostgreSQL and Drizzle require identifiers, so the schema uses
`volunteers_<field>_check`. The expressions and bounds are copied exactly; only
the otherwise-unspecified constraint names were chosen.

**Known gap:** SRS 8.2 specifies `WITH (fillfactor = 85)` on `volunteers`.
Drizzle 0.45's PostgreSQL schema API cannot express table storage parameters.
This must be added through reviewed custom SQL in the first migration cycle
(for example, a migration-level `ALTER TABLE volunteers SET (fillfactor = 85)`
after table creation) rather than being silently omitted. The exact placement
must be checked against how `drizzle-kit` wraps generated SQL.

**Reason:** The SRS requires exact types, constraints and indexes, while also
forbidding migrations before review. Keeping the schema split by table/domain
makes the next groups reviewable and prevents a single unreviewable schema file.
The fillfactor gap is documented because it cannot be represented in the
TypeScript schema and must not be forgotten during migration review.

**Status:** Implemented and validated with TypeScript, Drizzle schema export,
metadata inspection and inferred select/insert type checks. Task 3 generated the
initial migration and added the fillfactor statement. Next dependency:
`office_assignments` plus its four enums (`user_role`, `tech_kind`,
`builder_kind`, `access_status`).

---

## D-021: `current_date` defaults versus IST calendar days (19 Oct 2026)

**Decision:** Keep the exact SRS defaults `DEFAULT current_date` on
`volunteers.join_date` and `volunteer_domains.since`. PostgreSQL evaluates
`current_date` in the database session timezone, which may be UTC on Supabase.
Services that need an exact IST calendar day must pass the date explicitly
rather than relying on the default near midnight. The schema does not set a
session timezone and does not replace the SRS default with a custom expression.

**Reason:** SRS 8.2 specifies both `DEFAULT current_date` and IST calendar-day
semantics for `date` columns. Changing the default silently would be a schema
deviation; ignoring the timezone difference could record the wrong day. This
entry records the tension so the service layer handles it deliberately.

**Status:** Documented; no schema deviation. Revisit when the date/time service
layer is implemented.

---

## D-022: Initial migration and partial manual security SQL (19 Oct 2026)

**Decision:** Use one generated migration file for the foundational schema,
edit only the generated SQL to add `ALTER TABLE volunteers SET (fillfactor = 85)`,
and put the applicable SRS 8.7 role/RLS/timeout/SYSTEM SQL in
`drizzle/manual/security.sql`. Apply the migration first and the manual file
second, both through the admin connection. The migration file is left for review
and has not been git-committed by this task.

- The migration is `drizzle/0000_moaning_ricochet.sql`. It is treated as
  immutable after first application; future schema changes get a new migration.
- `security.sql` is repeatable. It creates `app_user` only when missing, drops
  and recreates its own policies, and inserts `SYSTEM` with
  `ON CONFLICT DO NOTHING`.
- The `app_user` password is never committed. The role is created without a
  password and the operator sets it from the secret store.
- Audit restrictions are guarded by `to_regclass('public.audit_log')` so the
  same file can be re-run when the audit table is added. This is not a silent
  skip: the block was tested against a temporary table and then removed.
- `purge_audit_log()`, the `pg_cron` schedule and
  `delete_volunteer_permanently()` are deliberately **not** created yet. They
  reference tables from later schema groups; a partial permanent-delete
  function would violate SRS 8.7 and rule 26.
- Counter maintenance remains in the SRS 11.10 TypeScript feature functions.
  No database trigger or generic counter function was added.
- Local validation uses a disposable PostgreSQL instance. Production and
  staging are not touched by this task.

**Reason:** The SRS requires one reviewed, versioned migration, an application
role that cannot run DDL, RLS on every table and insert-only audit access. The
generated SQL cannot express fillfactor, so that one physical storage setting
must be patched at the migration layer. The manual functions cannot be safely
created before their dependent tables exist; documenting and deferring them is
safer than shipping functions that fail at runtime or delete incomplete data.

**Status:** Migration and applicable manual SQL verified on local PostgreSQL
17.11. Deferred blocks are recorded in `drizzle/manual/README.md`. Re-run
`security.sql` after every schema group that adds a table or a
`volunteers` foreign key.

