# AI Development Workflow

## Project objective

Build the NSS Central Management System as a responsive, internal office-management application using Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui and Drizzle ORM with Supabase PostgreSQL.

## Current phase

Part 3: server-only database infrastructure, the foundational schema group
(`projects`, `volunteers`, `volunteer_domains` and their four enums), the initial
initial migration file, and the applicable SRS 8.7 manual security SQL. The UI
still uses synthetic mock data; later schema groups, the deferred audit/delete
functions, authentication and business features are separate, approved tasks.
`docs/SRS.md` Section 22 controls the build order where this file and the SRS
disagree.

## Mandatory rules

1. Read `docs/SRS.md`, `docs/PERMISSIONS.md`, `docs/UI_SPEC.md` and `docs/PROGRESS.md` before making changes.
2. Use strict TypeScript. Do not use `any` to bypass type errors.
3. Prefer React Server Components. Add `"use client"` only where browser interaction, state, effects or browser APIs require it.
4. Keep page files thin. Put feature-specific UI in `src/features/`, generic UI in `src/components/`, and shared logic in `src/lib/`.
5. Reuse components, types, schemas and formatters. Avoid duplicate implementations.
6. Use synthetic mock data in the UI. Database infrastructure is allowed only in the server-only `src/db/` layer; do not connect screens to real data or implement production authentication/business features without explicit approval.
7. Never treat a hidden button, client-side role or mock permission check as real authorization.
8. Do not hardcode business data inside page components. Use typed mock-data modules.
9. Make layouts responsive, keyboard accessible and suitable for low-end Android devices.
10. Use semantic HTML, loading states, empty states, error states and confirmation dialogs where appropriate.
11. Avoid unnecessary dependencies, API requests, effects, polling and client-side JavaScript.
12. Do not rewrite unrelated files or introduce a new architectural pattern without justification.
13. Never silently delete existing work, change dependencies unnecessarily or overwrite another agent's changes.
14. Run linting, TypeScript checks and a production build when available. Report failures honestly.
15. Update `docs/PROGRESS.md` and `docs/DECISIONS.md` after each completed task.
16. Try to use open source components as much as where possible. Install them wherever needed, but keep the UI overall consistant, aesthetic, minimal, smooth and premium. It should be responsive too.

## Required completion report

- Files created or changed
- Features implemented
- Commands and tests run
- Test results and known failures
- Accessibility and responsive checks performed
- Decisions made and their rationale
- Remaining tasks and dependencies

Stop after the assigned task. Do not begin the next phase without approval.
