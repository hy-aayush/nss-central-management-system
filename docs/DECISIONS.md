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


