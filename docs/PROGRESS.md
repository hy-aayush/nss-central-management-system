# Database Foundation Readiness Audit

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
