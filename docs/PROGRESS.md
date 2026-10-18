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
- [x] Production build passes (57 static and partially prerendered routes generated in 3.5s).

## Current task

Events Directory, Event Detail, Central & Project Event Creation Forms, and Attendance Register with Audited Correction Flow implemented, statically prerendered, and visually verified.

## Blockers

- None. All validation suites pass cleanly.

## Latest validation

- TypeScript check (`npx tsc --noEmit`): PASSED (Exit code 0, 0 errors)
- ESLint (`npm run lint`): PASSED (Exit code 0, 0 errors)
- Production Build (`npm run build`): PASSED (Exit code 0 - all 57 static / PPR routes compiled)
- Visual Browser Validation: PASSED (Desktop & mobile verified across `/events`, `/events/1`, `/events/central/new`, `/events/project/new`, and `/attendance` including correction modal flow)

## Decisions pending / Assumptions recorded

- Staff-only field masking: Phone number and blood group are only accessible to coordinators and internal office staff; student views are completely masked per Section 6.
- FCFS Reliability lockout: 3 missed FCFS events triggers an automated 30-day lockout; UI surfaces warning at >= 2 missed slots.
- Coordinator Notes edit budget: Limited to 3 edits per semester per volunteer (soft rule S-06) with remaining edits tracked in the UI.
- Attendance Locked State: When an event attendance session is locked, manual roll-call toggling is prevented and routed to the Audited Correction Flow requiring >= 10-char justification (SRS §11.7).
- Multi-Wing Collaboration Cap: Project events strictly limit collaborating wings to at most 2 (max 3 total including host) per soft rule S-09.

## Next task

Proceed to Meetings management (`/meetings`), Service Hours approvals & adjustments (`/hours`), and Approval Requests / Emergency Packs (`/requests`).

