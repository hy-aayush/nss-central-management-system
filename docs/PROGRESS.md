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
- [x] Operational Dashboard completed (`src/app/(office)/dashboard/page.tsx`):
  - Internal office command center conforming to SRS Sections 7, 8.6, 10.8, and 18.5.
  - Core KPI statistics via `StatCard`: Total Active Volunteers (384), Service Hours Approved (5,610), Average Turnout Rate (90.4%), and Events Completed (138).
  - Prominent synthetic demonstration sandbox banner and data quality operational alerts (`DataQualityAlert`).
  - Isolated Client Components for visual analytics:
    - `GenderDonutChart`: Recharts donut chart with hydration-safe `useSyncExternalStore` pattern displaying 54.7% Male / 45.3% Female distribution.
    - `MonthlyTrendsChart`: Dual-metric AreaChart visualizing 6-month service hours logged and turnout rate trajectories.
  - Server-rendered operational cards:
    - `UpcomingEventsCard`: Scheduled events and meetings with IST time formatting (`formatDateIST`, `formatTimeIST`), expected turnout, and status badges.
    - `RecentAttendanceCard`: Verified attendance summaries, turnout ratio progress bars, and lock status indicators.
    - `ProjectDistributionCard`: All 9 designated SDG project wings with active volunteer registers, hours logged, turnout, and PR leads.
    - `QuickActionsCard`: Direct responsive navigation shortcuts to core administrative workflows (volunteers, projects, events, attendance, hours, requests, audit).
    - `RecentAuditCard`: Feed of immutable security and sensitive administrative actions with actor roles and timestamps.
  - Dedicated `DashboardLoading` skeleton (`loading.tsx`) and `DashboardError` boundary (`error.tsx`).
  - Responsive layout verified across mobile (390x844) and desktop (1280x800) with zero horizontal overflow.
- [x] Production build passes (all 24 routes prerendered).

## Current task

NSS Central Management System internal office dashboard implemented and fully validated.
All visual components, server/client boundaries, mock data access queries, and responsive layouts verified.

## Blockers

- None. All validation suites pass cleanly.

## Latest validation

- TypeScript check (`npx tsc --noEmit`): PASSED (Exit code 0, 0 errors)
- ESLint (`npm run lint`): PASSED (Exit code 0, 0 errors, 0 warnings)
- Production Build (`npm run build`): PASSED (Exit code 0 - all 24 routes prerendered)
- Visual Browser Validation: PASSED (Desktop 1280x800 & Mobile 390x844 verified without layout shifts or horizontal overflow)

## Decisions pending

- Final staff roster source (`seed/staff.template.csv` vs `seed/local/staff.csv`)
- Production Supabase Google Workspace OAuth setup

## Next task

Proceed to Volunteer Directory module (`src/app/(office)/volunteers/page.tsx` and details `[id]/page.tsx`) with search, multi-factor filtering, field masking, and attendance/hours ledgers.
