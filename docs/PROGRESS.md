# Project Progress

## Current phase

Part 1: Frontend foundation

## Completed

- [x] Next.js project initialized (Next.js 16.4.0 Turbopack)
- [x] Git repository initialized
- [x] Dependencies inspected
- [x] shadcn/ui configured
- [x] Design tokens and theme established
- [x] Application shell completed
- [x] Configuration foundations created in `src/config/`:
  - `identity.ts`: Institutional domain `kiit.ac.in`, `ROLL_NUMBER_PATTERN` (`/^[0-9]{6,10}$/`), `emailFromRoll`, `rollFromEmail`, `batchYearHintFromRoll`.
  - `app.ts`: Timezone `Asia/Kolkata`, `LOCALE = "en-IN"`, academic year start month (July), limits, gender constants, project names.
  - `limits.ts`: Default `LIMITS` and `STRICT_OVERRIDES` per SRS Appendix C.
- [x] Time & date library created in `src/lib/time.ts` for IST formatting, academic year calculation, start-of-next-day IST lock calculation, and attendance window evaluation.
- [x] Strongly typed domain models conforming strictly to updated `docs/SRS.md` Section 10:
  - `src/types/auth.ts`: `UserRole`, `TechKind`, `BuilderKind`, `AccessStatus`, `PostKind`, `POST_TIER`, `OfficeAssignment`, `RosterEntry`, `EmergencyPack`, `EmergencyScope`, `ActorContext`, `StaffMember`.
  - `src/types/project.ts`: `ProjectId` (1..9), `ProjectName`, `PROJECT_ID_BY_NAME`, `PROJECT_NAME_BY_ID`, `CREATIVE_DOMAINS` (4 specialisations), `Domain`, `ProjectRepresentative`, `Project`, `DomainSummary`.
  - `src/types/volunteer.ts`: `VolunteerBasic` (masked to roll, name, project), `VolunteerSummary`, `VolunteerDetail`, `VolunteerStats`, `VolunteerFilterState`, `RedFlag`.
  - `src/types/event.ts`: `EventType`, `ParticipationMode`, `StoredEventStatus`, `EventStatus` (with derived `ONGOING`), `AttendanceStatus`, `ParticipantSource`, `CollabApproval`, `EventProjectSlot`, `EventRecord` (integer `id`), `MeetingType` (`"PROJECT" | "CENTRAL" | "BUILDERS"`), `Meeting` (integer `id`, date string `YYYY-MM-DD`, time `HH:mm`), `AttendanceCorrection`, `AttendanceSummary`.
  - `src/types/hours.ts`: `EventCategory`, `EventGroup`, `HoursAdjustment`, `VolunteerYearHours`.
  - `src/types/requests.ts`: `RequestKind`, `RequestStatus`, `ApprovalRequest`, `ImportPreview`.
  - `src/types/audit.ts`: `AuditAction`, `AuditEntityType`, `AuditOutcome`, `AuditLogEntry`, `AuditFilterState`.
  - `src/types/analytics.ts`: `DashboardSummary`, `VolunteerMetrics`, `HoursMetrics`, `EventMetrics`, `MeetingMetrics`, `ProjectAnalyticsSummary`, `DomainAnalyticsSummary`, `MonthlyTrendPoint`, `DataQualityIssue`.
- [x] Synthetic mock data (`src/lib/mock-data/`):
  - `volunteers.ts`: 15 complete synthetic volunteer records conforming to `VolunteerDetail`.
  - `projects.ts`: 9 fixed projects (IDs 1..9) mapped to SDGs, 4 creative domains with leads.
  - `events.ts`: 9 events with integer IDs, collaboration slots, and 3 tri-partite meetings with MOM.
  - `staff.ts`: Staff roster with `techKind` and `builderKind`, conforming to `StaffMember` and `RosterEntry`.
  - `attendance.ts`: Event and meeting attendance records and turnout summaries with integer entity IDs.
  - `audit-logs.ts`: Immutable audit entries conforming to `AuditLogEntry` with `at`, `actorRoll`, and `summary`.
  - `analytics.ts`: Complete dashboard metrics with gender breakdown, meeting metrics, and data quality issues.
  - `index.ts`: Typed data access layer with numeric ID and string roll number query helpers.
- [x] Route & navigation inventory:
  - Added routes: `/meetings`, `/hours`, `/requests`, and `/audit` matching SRS Section 18.5.
  - Updated `MAIN_NAV_ITEMS` in `src/lib/navigation.ts` to include `Meetings`, `Hours`, `Requests`, and `Audit Logs`.
- [x] Documentation alignment:
  - `docs/DATABASE.md`: Exact PostgreSQL DDL matching Section 8 (all 15 tables, enums, unlogged tables, RLS).
  - `docs/PERMISSIONS.md`: Role & permissions specification matching Sections 4, 5, 6 (ActorContext, tiers, 2-man rule, emergency packs, soft rules S-01 to S-09, field-level masking).
- [x] Generic shared UI components:
  - `StatusBadge`, `StatCard`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, `DataTable` (TanStack Table v9).
- [x] Operational Dashboard completed (`src/app/(office)/dashboard/page.tsx`).
- [x] Volunteer Directory & Detail modules completed:
  - `src/features/volunteers/volunteer-stats-bar.tsx`: Active volunteer totals, 2nd/3rd/4th year distribution, domain specialists, average turnout.
  - `src/features/volunteers/volunteer-table.tsx`: Search across name, roll number, email; filter by project, domain, year, status; shareable URL query parameters (`?search=...&project=...&page=...`); desktop sortable table and mobile card alternative.
  - `src/app/(office)/volunteers/page.tsx`: Server Component with `PageHeader`, KPI stats bar, and `<React.Suspense>` streaming for client table.
  - `src/features/volunteers/volunteer-profile-header.tsx`: Profile banner with initials avatar, roll number, project pill, office bearer role, masked contact credentials, blood group, city/state, and hostel.
  - `src/features/volunteers/volunteer-detail-cards.tsx`: Approved hours, event turnout, meeting attendance, FCFS reliability with penalty warning (SRS Section 8.3), and confidential coordinator note with remaining edit budget (SRS S-06).
  - `src/features/volunteers/volunteer-history-tabs.tsx`: 4 switchable tabs (Event Participation History, Meeting Attendance, Service Hours Ledger, and Security/Audit Trail).
  - `src/app/(office)/volunteers/[id]/page.tsx`: Server Component with `generateStaticParams()` for all 15 synthetic roll numbers, lookup, and not-found empty state.
- [x] Project Directory & Detail modules completed:
  - `src/features/projects/project-stats-header.tsx`: 9 designated wings, deployed volunteer headcounts, total service hours, community drives count.
  - `src/features/projects/project-grid.tsx`: All 9 projects mapped to SDGs with description, PR leads, hours, turnout rates, and search filtering.
  - `src/features/projects/domain-roster-section.tsx`: 4 specialized creative domains (Photography, Video Editing, Graphic Designing, Content Writing) with leads and roster links.
  - `src/app/(office)/projects/page.tsx`: Assembled projects directory with statistics, grid, and domain wings.
  - `src/features/projects/project-detail-hero.tsx`: Wing header with SDG badges, PR leadership cards, hours, drives, and turnout rates.
  - `src/features/projects/project-detail-tabs.tsx`: 4 switchable tabs (Assigned Volunteers table, Outreach Drives list, Wing Meetings, and Creative Domain & Cohort Analytics).
  - `src/app/(office)/projects/[slug]/page.tsx`: Server Component with `generateStaticParams()` for all 9 project slugs, lookup, and not-found empty state.
- [x] Event Management & Attendance modules completed:
  - `src/features/events/event-schemas.ts`: Zod validation schemas for Central and Project events, enforcing IST date bounds, start-before-end, FCFS opening before locking, lock-before-start (SRS §11.3), and wing slot quota consistency.
  - `src/features/events/events-stats-header.tsx`: KPI cards for Total Events, Central Drives, Project Drives, Upcoming/Live sessions, and Average Turnout Rate.
  - `src/features/events/events-table.tsx`: Searchable, filterable (Type, Status, Wing), sortable (Date, Title) event roster with responsive mobile cards and TanStack pagination.
  - `src/features/events/event-form.tsx`: Separate typed `CentralEventForm` and `ProjectEventForm` with multi-wing collaboration rules (max 2 collaborating wings per S-09), year-wise caps, and two-step Review → Confirm dialogs with explicit simulation disclaimers.
  - `src/app/(office)/events/central/new/page.tsx` & `src/app/(office)/events/project/new/page.tsx`: Dedicated creation routes.
  - `src/app/(office)/events/page.tsx`: Server Component with metric cards, table view, and `<React.Suspense>` streaming.
  - `src/features/events/event-detail-hero.tsx`: Header banner with date, venue, hours credit, lock status, and confirmation dialogs for early lock and cancellation.
  - `src/features/events/event-detail-tabs.tsx`: 4 switchable tabs (Enrolled Participants Roster, Project Wing Slots allocation, Turnout Summary with visual meters, and Governance & Audit Trail).
  - `src/app/(office)/events/[id]/page.tsx`: Prerendered via `generateStaticParams()` across all mock events.
  - `src/features/attendance/attendance-schemas.ts`: Audited correction schema requiring minimum 10-character reason justification (SRS §11.7) and bulk status marking.
  - `src/features/attendance/attendance-stats-bar.tsx`: Real-time session KPI bar (Total Roster, Present, Absent, Excused, Turnout %, Lock status badge).
  - `src/features/attendance/attendance-event-selector.tsx`: Session switcher dropdown synchronized with URL query params (`?eventId=...`).
  - `src/features/attendance/attendance-roster-table.tsx`: Interactive roll-call table with P (Present), A (Absent), E (Excused) toggles, print sheet contingency, quick filters, and intercepting locked sessions into the audited correction modal.
  - `src/features/attendance/attendance-correction-dialog.tsx`: Audited correction modal with character count counter, reason validation, and old/new state badges.
  - `src/features/attendance/attendance-history-panel.tsx`: Immutable ledger of past corrections with timestamps, old/new statuses, and officer IDs.
  - `src/app/(office)/attendance/page.tsx`: Attendance register route with streaming Suspense boundary.
- [x] Institutional Analytics & Reporting module completed (`src/app/(office)/analytics/page.tsx`):
  - `src/features/analytics/analytics-definitions.tsx`: Expandable definitions reference explaining Turnout %, Approved Service Hours, Active Standing, FCFS Reliability Index, Domain Engagement, and IST timestamp convention.
  - `src/features/analytics/analytics-kpi-header.tsx`: Summary metric cards for Active Volunteers (year-wise breakdown), Approved Service Hours, Average Turnout Rate (90.4%), Completed Drives (138), and gender distribution.
  - `src/features/analytics/analytics-project-comparison.tsx`: Performance and turnout matrix across all 9 designated project wings with search, sortable metrics, turnout progress meters, and PR leadership.
  - `src/features/analytics/analytics-monthly-trends.tsx`: Month-by-month historical trend breakdown (May - Oct 2026) with community drive counts, attendance rates, and service hours delivered.
  - `src/features/analytics/analytics-domain-summary.tsx`: Dedicated analysis of the 4 creative domains (Photography, Video Editing, Graphic Designing, Content Writing) with cross-domain overlap matrix and gender ratios.
  - `src/features/analytics/analytics-view.tsx`: Client coordinator with reporting time horizon selector (Academic Year 2026-27, Q1, Q2, Last 30 Days), tab switcher, and bounded CSV data export trigger.
- [x] Security & Audit Ledger module completed (`src/app/(office)/audit-logs/page.tsx` & `/audit`):
  - `src/features/audit/audit-stats-header.tsx`: Immutable ledger metric cards for Total Ledger Records (13), Emergency Actions (2), Security Blocks / Denied Access Attempts (1), and Operating Officers (6).
  - `src/features/audit/audit-table.tsx`: Searchable and filterable ledger (by Actor/Search, Action, Entity Type, Project Wing, Outcome, and Emergency filter toggle) with responsive desktop table and mobile layout.
  - `src/features/audit/audit-detail-dialog.tsx`: Detail modal with JSON before/after state diff, correlation ID, actor role tier, origin IP, and mandatory policy justification reason.
  - Distinguished visual styling for emergency actions (`EMERGENCY_ACCESS_GRANT`, `EMERGENCY_ACCESS_REVOKE`) with amber badges and clock indicators.
- [x] Staff Directory & Team Management module completed (`src/app/(office)/team/page.tsx`):
  - `src/features/team/team-stats-header.tsx`: Metric cards reflecting post tiers: Tier 5 Coordinators, Tiers 4/3 Tech Team, Tier 2 Project Representatives, and Tiers 1-2 Builders & POCs.
  - `src/features/team/team-roster-table.tsx`: Filterable staff directory with search by name/roll/email, role tier filters, active/suspended status filter, role edit trigger, and sensitive suspension/reinstatement confirmation dialogs.
  - `src/features/team/role-assignment-dialog.tsx`: React Hook Form + Zod schema modal allowing role assignments, project scope assignment, tech/builder sub-ranks, reason justification, and two-step confirmation alert for Tier 5/4 escalations.
  - `src/features/team/team-manager.tsx`: Client state manager coordinating synthetic roster updates and dialog interactions.
- [x] Operational Settings & System Overview module completed (`src/app/(office)/settings/page.tsx`):
  - `src/features/settings/settings-system-overview.tsx`: Supabase Free-Tier Operational Guards (500MB DB quota status, Auth user quotas, and unlogged tables for fast FCFS queues).
  - `src/features/settings/settings-guardrails-form.tsx`: Soft-rules configuration form for S-01 to S-09 guardrails (FCFS window duration, max collaborators, MOM window, edit budgets, absence thresholds, domain tenure hours).
  - `src/features/settings/settings-emergency-card.tsx`: Global FCFS circuit breaker toggle with confirmation dialog, emergency pack overview, and prominent simulation notice.
  - `src/features/settings/settings-view.tsx`: Tabbed coordinator for System Status, Soft Rules, and Emergency Circuit Breakers.
- [ ] Production build verification pending: attempts during this review did not complete; see review results below.

## Current task

Independent frontend review against `docs/SRS.md`, `docs/UI_SPECS.md`, `docs/PERMISSIONS.md`, and `docs/AI_WORKFLOW.md` (2026-10-19). The repository's UI spec file is named `UI_SPECS.md` (plural); `UI_SPEC.md` does not exist.

## Review findings and changes

- **Critical — none identified** in this frontend-only review.
- **High — production authorization is not implemented.** Role labels, navigation and confirmations are prototype UI only; as required by the workflow and permissions spec, they provide no security boundary. Keep this mock-data phase off production until server authentication, per-request authorization, and RLS are implemented and tested.
- **Medium — fixed:** event form participation choices were not proper keyboard-operable controls, live review state could be stale, and React Hook Form `watch()` produced React Compiler lint warnings. Choices now use controlled radio inputs and watched values; attendance and role dialogs use focused subscriptions.
- **Medium — fixed:** the command dialog lacked its cmdk context and sidebar menu label lacked its required group, breaking those interactions; added the missing wrappers. Dashboard breadcrumb keys are now unique.
- **Low — fixed:** replaced identifiable-looking coordinator mock identity with explicitly synthetic data, removed duplicate date/time formatter implementations, and replaced nonfunctional CTAs on unfinished Meetings / Hours / Requests screens with honest prototype status text.
- **Low — caching:** enabled the 30-second Next.js client router stale time specified in the SRS. This is browser-side route segment reuse, not shared caching of private data. Current feature pages read local synthetic fixtures and make no Supabase calls, so no database request reduction is measurable yet. Future private-data routes must remain uncached in shared server caches and be refreshed after mutations.

## Latest validation (2026-10-19)

- `npx tsc --noEmit`: **PASSED** after frontend fixes (exit 0).
- `npm run lint`: **PASSED** after frontend fixes (exit 0, no warnings).
- `npm run build`: **NOT VERIFIED**. Three attempts did not finish; the latest remained at “Creating an optimized production build” with no diagnostics for 90 seconds and was stopped. No successful production build is claimed.
- Browser routes: **manual in-app browser smoke check** visited `/dashboard`, `/volunteers`, `/events`, `/attendance`, `/meetings`, `/hours`, `/requests`, `/analytics`, `/audit-logs`, `/team`, `/settings` at a narrow viewport; route headings rendered and no document horizontal overflow was observed. This is not a Playwright test suite.
- Command palette and account menu interactions: manually opened successfully after the context fixes.
- Mobile navigation drawer/focus behavior: **outstanding**; the dev server became unavailable during the follow-up check, so no successful post-fix drawer assertion is claimed. An earlier direct mobile route load reported a hydration mismatch; verify on a clean dev session.
- Automated browser tests: **not run**. Playwright 1.64 is installed, but its Chromium executable is missing; the repository has no test script/config/specs. No browser download was attempted.
- Browser console: an earlier session reported a mobile sidebar hydration mismatch (outstanding, see above). The dashboard duplicate-key warning was fixed. Recheck console and errors in a clean browser session.
- Bundle size, contrast, keyboard/focus, reduced-motion, and screen-reader audits: **not measured**; no bundle analyzer or accessibility test suite is configured.

## Outstanding / dependencies

- Re-run production build in an isolated output directory or when the pre-existing dev server is stopped.
- Install/enable a managed Playwright browser and add repeatable route, interaction, and accessibility tests.
- Verify mobile drawer hydration and behavior, focus restoration, reduced-motion behavior, and color contrast.
- Keep backend authorization, RLS, private-data no-store behavior, and shared aggregate caching in the backend phase; this review did not implement backend work.

## Decisions pending / Assumptions recorded

- Staff-only field masking: Phone number and blood group are only accessible to coordinators and internal office staff; student views are completely masked per Section 6.
- FCFS Reliability lockout: 3 missed FCFS events triggers an automated 30-day lockout; UI surfaces warning at >= 2 missed slots.
- Coordinator Notes edit budget: Limited to 3 edits per semester per volunteer (soft rule S-06) with remaining edits tracked in the UI.
- Attendance Locked State: When an event attendance session is locked, manual roll-call toggling is prevented and routed to the Audited Correction Flow requiring >= 10-char justification (SRS §11.7).
- Multi-Wing Collaboration Cap: Project events strictly limit collaborating wings to at most 2 (max 3 total including host) per soft rule S-09.
- Operational Settings & Circuit Breakers: Clear UI disclaimers state that kill switches, quota checks, and emergency mode are simulated frontend prototypes in Part 1 and require the Part 2 backend and RLS policies to be active.
- Role Escalations: Tier 4/5 role assignments require explicit justification and secondary confirmation, mirroring the approved institutional 2-man rule.

## Next task

Proceed to Meetings management (`/meetings`), Service Hours approvals & adjustments (`/hours`), and Approval Requests / Emergency Packs (`/requests`).


