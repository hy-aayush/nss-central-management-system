# NSS SCE KIIT Central Management System — Software Requirements Specification

| | |
|---|---|
| Product | Private portal for NSS SCE KIIT: volunteers, projects, events, meetings, attendance, hours and records |
| Users | Coordinators, Tech Team, Builders (including POCs and Domain Leads), Project Representatives (PRs). **Volunteers never log in.** |
| Stack | Next.js (App Router) + TypeScript strict, Supabase (Postgres + Auth), Drizzle ORM, Tailwind + shadcn/ui |
| Cost | Everything free. Supabase **Free plan only**. No paid service anywhere. |
| Time | India Standard Time, `Asia/Kolkata` (UTC+05:30, no daylight saving). Stored in UTC, always shown in IST. |
| Language and format | English. Indian formats (`en-IN`): `18 Oct 2026`, 12-hour clock with am/pm. |
| Source of truth | This file. If code and this file disagree, fix one of them in the same PR. |

---

## 0. How to read this document (humans and AI agents)

AI agents are going to build this system from this file, mostly without anyone watching every step. So it is written to be followed literally. Read in this order:

1. Section 1: what the portal is and is not.
2. Section 2: the free-tier limits we live inside.
3. Section 3: **the rules every agent must follow**, and the list of soft rules that can be overridden.
4. Sections 4 to 6: who can do what.
5. Sections 8 and 10: database schema and TypeScript types. Copy them exactly.
6. Sections 11 to 17: behaviour, caching, limits. These decide how things work.
7. Section 18: frontend. Section 20: tests that must pass.

How rules are marked:

- **HARD rule**: never bypassed by anyone, not even a Coordinator or Tech. Security, audit, uniqueness, scope, counters.
- **SOFT rule**: a guardrail for PRs, POCs and Builders. A Coordinator or Tech member can override it with a written reason, and the override is audited. All soft rules are listed in Section 3.2. People make mistakes, so the system must always have a way to fix them without touching the database by hand.
- **Default**: a value that lives in `settings` (editable from the UI) or in `src/config/*.ts`. Never hard-code a default somewhere else.

If something is not covered here, do not guess. Stop, and add it to Section 21.2 (open decisions) with the safest default.

---

## 1. What this is

### 1.1 Purpose

NSS SCE KIIT runs 9 projects with about 950 active volunteers and a large number of events and meetings every year. Names, attendance and hours today live in chats and sheets. This portal is the **office record-keeping system**: one trusted place where PRs, builders, the tech team and coordinators record who registered, who came, how many hours they earned, and what happened.

### 1.2 What the portal is NOT

- Not a public site. Not a volunteer dashboard. Volunteers do not sign in, register, or see anything.
- Not where FCFS (first come first served seat registration) happens. **FCFS runs somewhere else.** PRs copy the names of their volunteers who got a seat into the portal. The portal records them, caps them by slots, locks the list, and later uses it for attendance and hours.
- No real-time sockets, no Redis, no microservices, no volunteer mobile app, no email/password login, no Supabase Storage/Realtime/Edge Functions/Data API. (Speed comes from caching in Section 16.4 and a small number of cheap queries, not from extra services.)

### 1.3 What is inside the portal

- Google login for approved people only (plus short-lived, narrow emergency access).
- Volunteer records (one per person) with project, domains, gender, stats, red flags, notes.
- Access roster and role history (who holds which post, per year).
- Nine projects with SDGs, two PRs each, activity status.
- Events: central events and project events (1–3 projects collaborating), FCFS name entry with slot limits, attendance, locking, corrections.
- Mega events (groups such as Special Camps) with special hours rules.
- Meetings (project, central, builders) with agenda, attendance and MOM (minutes, max 100 words).
- Hours: per-event hours, group rules, tagged manual extra hours, imported old hours, yearly rollup.
- Import of old volunteers, old events, old attendance and old hours, so hours are accurate from day one.
- Request and approval flow (Tech raises, Coordinator approves) for suspending, archiving and permanently deleting volunteers.
- Analytics: organization-wide for Coordinator/Tech, per project for PRs. Includes gender ratio.
- Audit log (who did what to whose record, short), 30-day default retention.
- Bounded CSV export with column pickers.
- Settings, feature flags, limits, emergency access.

### 1.4 Scale this system is built for

| Item | Number |
|---|---|
| Active volunteers | ~950: about 315 each in 2nd, 3rd and 4th year (about 105 per project). 4th years stay **ACTIVE**. They are busy with placements, but they can still attend events and earn hours. Nothing makes them inactive automatically. |
| Rows in `volunteers` (including archived, not yet deleted) | up to ~1,700 |
| Projects | 9 (fixed) |
| PRs (3rd year) | 18 (2 per project) |
| Coordinators (4th year) | ~9 (can change) |
| Tech Team | ~6 Members (3rd year) + a few Mentors (4th year, guide the team) |
| Builders / POCs / Domain Leads | a few dozen |
| Meetings per month | max 20 per project × 9 = **180 project meetings** + **20 central/builders** |
| Events per month | max **18 project-level** + **7 central** |
| Office users who log in | ~100 at most |
| Busiest moments | an FCFS window (18 PRs entering names inside ~60 minutes); a central event day (about 20 people marking attendance at the same time) |

Design for this size. Do not build for millions of rows.

---

## 2. Platform, free-tier limits and stack

### 2.1 Free-tier facts (checked Oct 2026 against the vendors' own docs; re-check every year)

| Service | Limit | What it means for us |
|---|---|---|
| **Vercel Hobby** | 1,000,000 function invocations / month | Every page load, server action, prefetch and API call is one invocation. |
| | 4 Active CPU hours / month (CPU counts only while code runs, not while it waits for the database) | The tighter limit. At about 40 ms of CPU per request, 4 hours is about 360,000 requests. Measure the real number in staging (Section 9.3). |
| | 100 GB data transfer / month | No problem for a text app. |
| | **Going over a limit pauses the project**, usually for about 30 days | This is the biggest risk of "the system went down". Sections 16.4 and 17 exist mainly to prevent it. |
| | Personal, non-commercial use only. One person's account; team collaboration is a Pro feature | NSS is a non-profit student unit, but confirm the terms. The yearly handover is awkward on Hobby (Section 19.5). See plan B in 2.5. |
| | Firewall: always-on DDoS protection; up to 3 custom rules; **exactly 1 rate-limiting rule**, counted per IP | Use the one rule (Section 17.2). Many students share one campus IP, so keep it generous. |
| | Cron: once a day at most, time not exact (fires somewhere in the hour) | Fine as the backup trigger. GitHub Actions is the main one (Section 15). |
| **Supabase Free** | 500 MB database | Budget in Section 9.1. |
| | 5 GB egress / month, 50,000 monthly active users | No problem. |
| | **60 direct and 200 pooler connections** | Always use the pooler (Rule 13). |
| | **Pauses after 7 days with no activity** | Keep-alive job (Section 15). |
| | **No automatic backups** | Our own weekly backup (Section 19.2). |
| | 2 free projects | We use both: production and staging. No third project for "restore tests". Test restores in local Docker Postgres. |
| | Small shared CPU, about 0.5 GB RAM | Few, indexed, set-based queries (Section 9.4). |
| **GitHub (private repo, free)** | About 2,000 Actions minutes / month; about 500 MB for Actions artifacts [verify]; scheduled workflows can start late | Keep backups small and few (Section 19.2). |
| **Google OAuth** | Free | Restricted to the institute domain. |

Sources: vercel.com/docs/limits, vercel.com/docs/plans/hobby, vercel.com/docs/vercel-firewall, supabase.com/pricing, docs.github.com (billing, Actions). If a number changes, update this table and `src/config/limits.ts` in the same PR.

**What will most likely take the site down, in order:** (1) a Vercel quota pause, (2) the Supabase 7-day idle pause, (3) database size. The design watches all three (Sections 9, 15, 17).

### 2.2 Allowed services

- **Supabase Free**: Postgres + Supabase Auth (Google provider). Nothing else from Supabase. No Storage, no Realtime, no Edge Functions, **no Data API / PostgREST** for app data.
- **Hosting**: Vercel Hobby for Next.js. Functions in Mumbai (`bom1`) if Hobby lets us pick it; otherwise the closest region. The Supabase project is in **Mumbai (ap-south-1)**.
- **GitHub** (private repo) + GitHub Actions for CI, the daily job and the weekly backup.
- **Google OAuth** (free) restricted to `kiit.ac.in`.
- Nothing else. A new service needs a line in Section 21 first.

### 2.3 Stack (pin exact versions at scaffold time)

Next.js App Router, React Server Components by default, TypeScript `strict`, Tailwind CSS, shadcn/ui (Radix), Lucide icons, Motion (light use), Drizzle ORM + `postgres` (postgres-js) driver, Zod, React Hook Form (complex forms only), TanStack Table, Recharts (lazy loaded), Sonner (toasts), Vitest + Testing Library, Playwright, `@supabase/ssr` for Google sign-in.

### 2.4 Auth decision

**Supabase Auth with the Google provider.** It proves *who the person is*. **All authorization comes from our own tables**, never from JWT claims. Verify the session on the server by checking the JWT signature locally (for example `getClaims()` with the project's signing keys; confirm the call exists in the pinned `@supabase/ssr` / `supabase-js` version). Never trust `getSession()` data on the server. Local verification means no network call to Supabase on every request.

### 2.5 Hosting plan B (future option): Cloudflare

Cloudflare was tried first and deployment caused problems, so v1 runs on Vercel. Keep Cloudflare as the documented next option because it may give: a free tier with a large request allowance, global edge delivery, free firewall/rate-limit rules, and no pause-on-quota for static assets. Costs of moving: a different runtime (check Node compatibility of Drizzle/postgres-js), an adapter for Next.js, and new deploy steps. The code keeps all hosting-specific things (cron routes, env names, headers) in one place (`src/lib/platform/`) so a move is a few files, not a rewrite. Re-check Cloudflare's free limits before moving; they are not verified here.

### 2.6 Time and locale

- Store `timestamptz` (UTC). Show everything in IST (`Asia/Kolkata`).
- `date` columns are IST calendar days.
- Display: `en-IN` locale. Dates like `18 Oct 2026`. Times like `6:30 pm`. Day boundaries come only from `src/lib/time.ts`.
- Academic year starts **1 July IST**.
- Never use the server's own time zone, `new Date().getHours()`, or `toLocaleString()` without `timeZone: "Asia/Kolkata"`.

---

## 3. Rules for AI agents

### 3.1 Hard rules

Break none of these. If a task seems to need breaking one, stop and ask.

1. **Never trust the client** for role, project, permissions or IDs. Build an `ActorContext` on the server from the database on every request.
2. Every service and repository function takes `ActorContext` as its first argument. The only exception: cached functions for shared data (Section 16.4). They take plain ids/years, contain no personal data, and are called only after the authorization check.
3. **Project scope is enforced inside the SQL `WHERE`**, not by filtering after the query.
4. For anything outside the actor's scope return `NOT_FOUND`, not `FORBIDDEN` (do not leak that it exists). Use `FORBIDDEN` only when the actor can see the thing but is not allowed to do that action.
5. **Deny by default.** If a permission is not written in Section 5, it is denied.
6. Every mutation runs through `runAudited()` (one DB transaction: the business write + the audit insert). Only exceptions: the ones in Section 13.3 (CSV import and export by Coordinator/Tech).
7. `audit_log` is **insert-only** for the app. No update/delete code path in the app. Only two database functions run by the table owner may touch old audit rows: `purge_audit_log()` and `delete_volunteer_permanently()` (Section 8.7).
8. Do not store derived data except the counters listed in Section 8. Rates, `year`, `email`, ONGOING, project status are **computed**.
9. Counters change **only** inside the functions named in Section 11.10 (finalise, correct, flag, hours recompute, history import, rebuild). Never `UPDATE volunteers SET ...count` anywhere else.
10. Use the exact IDs, enums and column types in Sections 8 and 10. Event/meeting IDs are **numbers**. Roll numbers are **strings**, validated only by `ROLL_NUMBER_PATTERN` in `src/config/identity.ts`. Never write a roll number regex anywhere else.
11. Time: `timestamptz` in UTC. All day boundaries and academic years come from `src/lib/time.ts` in IST.
12. The browser never receives a DB credential, a service-role key or direct Supabase data access. The browser Supabase client is used **only** to start Google sign-in.
13. Postgres connections go through the **Supavisor transaction pooler**. `prepare: false`, `max: 1` per serverless instance.
14. No polling, no websockets, no Realtime, no Redis, no Data API, no cron inside Next other than the idempotent `/api/cron/*` routes (Section 15).
15. Caching follows Section 16.4 exactly. No private data in shared caches. No `localStorage`/`sessionStorage` for private data.
16. Never `select *` for volunteers. Always a column list for the viewer's field level (Section 6).
17. Validate every input with Zod using the same bounds as the DB `CHECK`s (the roll number is the one deliberate exception: the DB check is looser, Section 8.2). Trim strings.
18. Table page size is max 50. Exports and bulk actions are bounded (Section 17).
19. Do not add a table, column, package, role, permission, setting or feature that is not in this SRS without updating this file and `docs/DECISIONS.md` in the same PR.
20. Development and staging use **synthetic data only**. Real volunteer data never goes in the repo, logs, screenshots, tests or AI prompts. The only real data in the repo is the office staff roll numbers in Appendix A.5; personal details for them stay in a git-ignored local file.
21. **Idempotency:** finalise, cron, imports and approvals must be safe to run twice.
22. The UI hides what a user cannot use. The **server check is the real gate**.
23. When two rules seem to conflict, the stricter one wins until the decision log says otherwise.
24. Every SOFT rule check goes through `checkSoftRule()` (Section 3.2). Never write an inline `if (role === ...)` for a soft rule.
25. Every mutation obeys Section 17: rate limit, size cap, idempotency key, no-op detection. A new mutation without them is a bug.
26. Whenever a table gets a foreign key to `volunteers`, update `delete_volunteer_permanently()` in the same PR. A test checks this (Section 20).
27. The `SYSTEM` row in `volunteers` is not a person. Hide it from every list, count, chart, export and dropdown.
28. Every write that is a "save" by a PR, POC or Builder goes through the two-step Review → Confirm flow and the edit budget (Section 11.2).

### 3.2 Soft rules (guardrails that can be overridden)

A soft rule stops mistakes by default but must never block real work. The pattern is always the same:

```ts
// src/lib/authz/soft-rules.ts
checkSoftRule(ctx, "S-01", { eventId, projectId }, { override?: { reason: string } })
// returns ok, or throws LIMIT_EXCEEDED / LOCKED with a plain message.
// An override is accepted only if ctx has "override:soft_rules" and reason is 10–300 chars.
// When used, the audit row gets changes.override = { rule: "S-01", reason }.
```

| ID | Soft rule | Bound people | Who may override | What an override looks like |
|---|---|---|---|---|
| S-01 | Slot total and per-year caps for a project in an event | PR | Coordinator, Tech | Add a walk-in beyond the cap, or raise the slots |
| S-02 | FCFS window (names only between open and lock) | PR | Coordinator, Tech | Add or remove names after the lock as `WALK_IN`, with a reason |
| S-03 | Edit budget (max 2 saved changes after the first save) | PR, POC, Builder | Coordinator, Tech | "Give 2 more edits" with a reason; or just make the change themselves |
| S-04 | Attendance opens 15 min before start | PR, POC | Coordinator, Tech | Mark any time before the lock |
| S-05 | Attendance lock (end of the event day) | everyone | Coordinator, Tech | Correct with a reason, or unlock (before finalise) |
| S-06 | MOM edit window (7 days after the meeting) | creator, PR | Coordinator, Tech | Write or edit MOM any time |
| S-07 | Year of the person when a post is granted (PR 3rd, Builder 3rd, Tech Member 3rd/4th, Mentor 4th, Coordinator 4th) | Tech granting | Coordinator | Grant anyway with a reason (Coordinators get a warning only) |
| S-08 | A collaboration event waits for every invited project to approve | event creator | Coordinator, Tech | Force-approve with a reason |
| S-09 | Max collaborating projects on one event (3) | PR, Builder | Coordinator, Tech | Add more |

Hard rules have no override. Examples: scope in SQL, audit, one attendance row per person per event, one PR slot taken by one person, counters only through the named functions.

---

## 4. People, access and roles

### 4.1 Everyone is a volunteer

Every person in NSS is a **Volunteer** (a row in `volunteers`). Coordinator, Tech Team, Builder, POC, Domain Lead and PR are **posts** (office assignments) held by volunteers. Posts rotate every year; the old holder steps down, and the volunteer record and the service history stay.

4th-year volunteers are normal volunteers. They stay `ACTIVE` until a Coordinator says otherwise. Many of them are busy with placements and attend less, but they can still join events and earn hours. Nothing in the system turns anyone inactive by itself.

### 4.2 Roles

Four roles exist in the database (`user_role`):

| Role | Who | Notes |
|---|---|---|
| `COORDINATOR` | Coordinators (4th year) | Highest authority. Full read of everything. The only role that can suspend, archive or permanently delete volunteers directly and that decides requests. |
| `TECH_TEAM` | Tech team, with `tech_kind` = `MENTOR` (4th year, guides the team) or `MEMBER` (3rd year) | Runs the system. Almost the same day-to-day powers as a Coordinator, **except** what Section 5 reserves for Coordinators. A Mentor has a few more powers than a Member (Section 5.2). |
| `PROJECT_REPRESENTATIVE` | PRs | Exactly **2 per project**, both 3rd year, equal authority. Scope = own project. Also part of builders (can create central events and meetings). |
| `BUILDER` | Builders, with `builder_kind` | `GENERAL`, `POC` or `DOMAIN_LEAD`. 3rd year. Domain Leads and POCs are part of builders. |

`builder_kind` matters only here: a **POC** may see name/roll/project of volunteers in **central** events and may take attendance in central events. `DOMAIN_LEAD` and `GENERAL` have no extra rights (a Domain Lead also carries a `domain`).

Year checks for each post are SOFT rule S-07 and are checked **only when the post is granted** (not later).

### 4.3 Rank (tiers) and how permissions combine

**Permissions are the union of everything a person's active posts allow.** A person who is PR and POC gets both sets. A person who is PR and Tech gets Tech's powers (which already cover the PR's). Nothing is lost by holding a second post.

Rank is used for only three things: the name shown on screen, who may act on whom, and the `actor_role` stored in the audit log.

| Tier | Post | Note |
|---|---|---|
| 5 | `COORDINATOR` | |
| 4 | `TECH_TEAM` / `MENTOR` | |
| 3 | `TECH_TEAM` / `MEMBER` | |
| 2 | `PROJECT_REPRESENTATIVE`, and `BUILDER` with kind `POC` | Same tier, different home ground (below). |
| 1 | `BUILDER` (`GENERAL`, `DOMAIN_LEAD`) | |

**Home ground.** For project matters (a project event, a project meeting, a project's volunteers) the PR of that project comes before a POC. For central matters (a central event or meeting) a POC comes before a PR. This only matters when two people of tier 2 meet on the same thing. Everywhere else the permission matrix already says who can do what.

**Who may act on whom** (grant, revoke, suspend access, flag, correct someone's work): only on people of a **strictly lower tier**. Two exceptions: Coordinators may act on other Coordinators, and a Mentor may manage Tech Members. **Nobody can act on their own access.**

```ts
// src/lib/authz/tier.ts
export const ROLE_TIER = { COORDINATOR: 5, MENTOR: 4, MEMBER: 3, PR: 2, POC: 2, BUILDER: 1 } as const;
export function tierOf(a: OfficeAssignment): number { /* map role + kind to the table above */ }
export function ctxTier(ctx: ActorContext): number { /* highest tier among active assignments; 0 for emergency-only users */ }
export function canActOn(actor: ActorContext, target: TargetTier): boolean { /* rules above */ }
```

### 4.4 Access gate (who can enter)

A person gets an application session only if **all** of these are true:

1. Google identity is verified (`email_verified = true`).
2. Email ends with `@` + `EMAIL_DOMAIN` and the part before `@` matches `ROLL_NUMBER_PATTERN` (both in `src/config/identity.ts`). If Google sends the Workspace `hd` claim, it must equal `EMAIL_DOMAIN`. The part before `@` is the roll number.
3. A `volunteers` row with that roll number exists and `status = 'ACTIVE'`.
4. **At least one** of: an `office_assignments` row for that roll that is active (`ends_at IS NULL` and `access_status = 'ACTIVE'`), **or** an active emergency grant (Section 4.9).

Otherwise: show the minimal "Access denied" page, no role disclosure, no private reads, and sign the Supabase session out. Log `LOGIN_DENIED` using the rules in Section 13.4 (capped, no personal data beyond the roll number).

This is checked **on every server request** in one cheap indexed query (Section 9.4). A suspended or revoked person loses access at their next request. Never cache this decision across requests.

A person who got in only through an emergency grant sees a **minimal shell**: only the emergency tasks page (Section 4.9). No other navigation.

### 4.5 Granting access (Team and access page)

Needs `manage:roster`. Who may grant what:

| Post being granted | Who may grant it |
|---|---|
| Coordinator | Coordinator |
| Tech Mentor | Coordinator |
| Tech Member | Coordinator, Tech Mentor |
| PR, Builder (General / POC / Domain Lead) | Coordinator, Tech (Mentor or Member) |

Steps:

1. Enter a **roll number**. The system loads the volunteer. **The volunteer must already exist** (create or import the volunteer first).
2. Show name, project, year, status. Ask: **what post does this person hold?** (role; tech kind; builder kind and domain; project and PR slot for PRs).
3. Checks. Hard: volunteer is `ACTIVE`, PR slot is free, one active row per role per person. Soft (S-07): year of the person.
4. Insert an `office_assignments` row. Audit `ROLE_GRANT`.
5. To remove a post: end it (`ends_at = now()`, `access_status = 'REVOKED'`, reason required). Audit `ROLE_REVOKE`.
6. To pause access without ending the post: `access_status = 'SUSPENDED'`. Audit `STAFF_SUSPEND`.

Tech may revoke or suspend the **office access** of lower tiers (this is about posts, not about the volunteer's status). Suspending the **volunteer** (`volunteers.status = 'SUSPENDED'`) is Coordinator only (Section 4.8) and also blocks login.

### 4.6 Lockout guards (hard)

- Nobody can revoke, suspend, archive or delete the **last active Coordinator**.
- Nobody can remove the **last active Tech Mentor**.
- A volunteer who holds an active post cannot be suspended, archived or deleted until the post is ended first.
- A person cannot grant, change or revoke their own access.
- The bulk "archive passed-out volunteers" action skips everyone who holds an active post and tells the user who was skipped.

### 4.7 Yearly rotation and handover

At the end of each term the Tech Team runs the rotation:

- End old assignments (`ends_at` set; history stays forever).
- Create new assignments. `batch_year` plus the computed year makes "3rd year" automatic, so there is no yearly bulk update of volunteers.
- After 1 July, current office holders compute as one year older. This is **normal**. The data-quality panel shows "rotation due" for posts whose holder's year no longer fits. It is not an error and nobody loses access because of it.
- Check the data-quality panel: every project has 2 PRs, every post has a holder.
- Hand over the runbook to the new tech members (Section 19.5).

### 4.8 Requests: Tech asks, Coordinator decides

Tech cannot suspend, reinstate, archive or permanently delete a volunteer, and cannot start a retention run on its own. Tech **raises a request**. A Coordinator approves or rejects it with one tap. Coordinators can also do all of these directly, without a request.

| Request kind | What approval does |
|---|---|
| `VOLUNTEER_SUSPEND` | `status = 'SUSPENDED'` |
| `VOLUNTEER_REINSTATE` | back to `ACTIVE` |
| `VOLUNTEER_ARCHIVE` | `status = 'ARCHIVED'` (hidden from default lists, nothing deleted) |
| `VOLUNTEER_DELETE` | permanent removal (Section 11.13). Only for people already `ARCHIVED`. |
| `RETENTION_RUN` | runs the retention tool (Section 11.14) |

Rules:

- A request holds **1 to 200 volunteers** (a whole passed-out batch can be one request; `VOLUNTEER_DELETE` max 50). A reason of 10–300 characters is required.
- **Requests page for Coordinators** (badge with the pending count in the navigation): one list, each row shows kind, who asked, why, and the volunteers (names, roll, project, year). Buttons: **Approve**, **Reject** (with an optional note), and **Approve all** for the visible page. Approving runs the action in the same transaction. For `VOLUNTEER_DELETE` the Coordinator types the number of people ("DELETE 12") before it runs, once per request.
- Tech sees its own requests and their status, and can cancel a pending one.
- A Coordinator cannot decide a request about themselves.
- A request expires after `request_expire_days` (default 14) and moves to `EXPIRED`.
- If execution fails for any person (for example, someone still holds a post), nothing is applied, the request becomes `FAILED` with a short message naming the roll number, and the requester fixes it and asks again.
- Audit: `REQUEST_CREATE`, `REQUEST_APPROVE`, `REQUEST_REJECT`, plus the action's own audit row (`VOLUNTEER_SUSPEND`, `VOLUNTEER_ARCHIVE`, ...). Decided requests are purged after 90 days.

### 4.9 Emergency access (narrow and short)

Sometimes the person who should do a job is not around and a Coordinator or Tech member is busy. Emergency access lets a Coordinator or Tech member hand **one small, scoped job** to an existing volunteer for a short time. It is **not** a way to hand out roles. The person cannot see or change anything outside the job.

Table: `emergency_grants` (Section 8.6). A grant is a **pack** tied to **one project, one event or one meeting**:

| Pack | Scope | What the person can do | What they can never do |
|---|---|---|---|
| `PROJECT_VIEW_BASIC` | one project | See **BASIC** fields (roll, name, project) of that project's volunteers | See phone, hostel, blood group, gender, city, notes, flags, hours, stats |
| `PROJECT_EDIT_BASIC` | one project | Everything in `PROJECT_VIEW_BASIC`, plus correct a **name** or **city/state** of that project's volunteers | Change status, project, gender, phone, batch year, or anything else |
| `EVENT_FCFS` | one event + one project | Enter or remove FCFS names for that project in that event, inside the normal FCFS window and slot limits | Touch other projects, or anything after the lock |
| `EVENT_ATTENDANCE` | one event (optionally narrowed to one project) | Mark attendance for that event's participants **before the lock** | Corrections after the lock, hours, other events |
| `MEETING_RUN` | one meeting | Start and end that meeting, mark its attendance, write its MOM (inside the MOM window) | Other meetings |

Rules:

- Grantee: any `ACTIVE` volunteer. They do **not** need a post.
- Granted by: Coordinator or Tech (`manage:emergency_access`). **Cannot grant to yourself.** A reason (10–300 chars) is required.
- **Time limit:** `expires_at` is at most `emergency_max_hours` from now (default 24). It ends automatically. A grant for an event or meeting also stops being useful once that event or meeting is locked.
- Limits: at most 3 active grants per grantee and 10 active grants per grantor.
- The pack only works for the scope written on the grant. The check is `emergencyAllows(ctx, action, resource)` in `src/lib/authz/emergency.ts`. Emergency packs **never** add anything to `ctx.permissions`.
- A person with only an emergency grant gets the minimal shell: one page, "Emergency tasks", listing their active grants and the screens for each.
- Every write made through a pack is audited with `changes.emergencyGrantId`. Granting and revoking are audited (`EMERGENCY_ACCESS_GRANT`, `EMERGENCY_ACCESS_REVOKE`). Any Coordinator or Tech member can revoke at any time.
- The permission resolver includes only grants where `now() BETWEEN starts_at AND expires_at AND revoked_at IS NULL`.

### 4.10 First setup and getting back in

- **Bootstrap.** Nobody can create the first Coordinator through the app (granting needs a Coordinator or Tech). The seed script (`scripts/seed.ts`, Appendix A.5) runs on the admin connection, creates the volunteers and their posts, and sets `granted_by` to the person themselves for these first rows.
- **Break-glass.** If every Coordinator and Tech Mentor is locked out, someone with the admin database password runs the SQL in `docs/RUNBOOK.md` ("Restore office access"). It re-activates one named Coordinator post. Using it is written down in the runbook log and told to the Coordinators.

---

## 5. Permission matrix

Permissions are strings (`PermissionAction`, Section 10.1). The server computes a person's permission list as the **union** over all their active posts (Section 4.3), then applies scope. Emergency packs are separate (Section 4.9).

Legend: ✅ allowed · ⚠️ allowed with the scope shown · ❌ denied. **PR** = Project Representative (scope = own project). **POC** = Builder of kind POC. **BLD** = other builders (General, Domain Lead). **TECH** = Mentor and Member unless a cell says otherwise.

### 5.1 Matrix

**Viewing**

| Permission | COORD | TECH | PR | POC | BLD |
|---|---|---|---|---|---|
| `view:dashboard:organization` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:dashboard:project` | ✅ | ✅ | ⚠️ own project | ❌ | ❌ |
| `view:volunteers:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:volunteers:project` | ✅ | ✅ | ⚠️ own project, FULL | ❌ | ❌ |
| `view:event:central:assigned_volunteers` | ✅ FULL | ✅ FULL | ⚠️ own project's volunteers FULL; other projects' = nothing | ⚠️ BASIC | ❌ |
| `view:event:project:assigned_volunteers` | ✅ FULL | ✅ FULL | ⚠️ own project's volunteers FULL; other projects' volunteers in that event = BASIC | ❌ | ❌ |
| `view:events:scheduled_and_ongoing:all` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `view:events:past:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:events:past:central` | ✅ full | ✅ full | ⚠️ analytics + own project's volunteer names | ⚠️ analytics only | ⚠️ analytics only |
| `view:events:past:project` | ✅ full | ✅ full | ⚠️ analytics of own project's past events; FULL details of own project's volunteers who took part; BASIC of other projects' volunteers who took part in an event their project was in | ❌ | ❌ |
| `view:analytics:cross_project` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:analytics:project` | ✅ | ✅ | ⚠️ own project | ❌ | ❌ |
| `view:audit_logs` | ✅ read-only | ✅ read-only | ❌ | ❌ | ❌ |

**Volunteers**

| Permission | COORD | TECH | PR | POC | BLD |
|---|---|---|---|---|---|
| `create:volunteer`, `import:volunteers` (CSV) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `import:history` (old events, attendance, hours) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `edit:volunteer:details` (name, gender, phone, hostel, blood group, city/state, batch year) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `edit:volunteer:affiliations` (project, domains) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `edit:volunteer:notes` | ✅ | ✅ | ⚠️ own project (edit budget) | ❌ | ❌ |
| `flag:volunteer` (reporter name is recorded) | ✅ | ✅ | ⚠️ own project | ❌ | ❌ |
| `revoke:red_flag` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `suspend:volunteer`, `reinstate:volunteer` | ✅ | ❌ (raises a request) | ❌ | ❌ | ❌ |
| `archive:volunteer` | ✅ | ❌ (raises a request) | ❌ | ❌ | ❌ |
| `delete:volunteer` (permanent) | ✅ (typed confirmation) | ❌ (raises a request) | ❌ | ❌ | ❌ |
| `request:volunteer_action` | ❌ (acts directly) | ✅ | ❌ | ❌ | ❌ |
| `decide:request` | ✅ | ❌ | ❌ | ❌ | ❌ |

**Events**

| Permission | COORD | TECH | PR | POC | BLD |
|---|---|---|---|---|---|
| `create:event:central` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create:event:project` | ✅ any project | ✅ any project | ⚠️ own project (+ collaboration) | ❌ | ❌ |
| `edit:event` (details, time, slots before FCFS opens) | ✅ any | ✅ any | ⚠️ own created or own-hosted (edit budget) | ⚠️ own created (edit budget) | ⚠️ own created (edit budget) |
| edit slots / FCFS times after FCFS opened (S-01, S-02) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `approve:event:collaboration` | ✅ | ✅ | ⚠️ PR of the invited project (either of the 2) | ❌ | ❌ |
| `force:event:collaboration` (S-08) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:event:fcfs` (enter names during the window) | ✅ any | ✅ any | ⚠️ own project's volunteers only (edit budget) | ❌ | ❌ |
| `edit:event:fcfs` (add/remove after the lock = walk-ins, may go over slots) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:event:attendance` | ✅ any event | ✅ any event | ⚠️ own-project events (all participants); in other events only own project's volunteers | ⚠️ central events, all volunteers | ❌ |
| `lock:event` (early lock, unlock before finalise, finalise now) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `correct:attendance` (after the lock, reason required) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:event_groups`, `manage:event_categories` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `archive:year` (events COMPLETED → ARCHIVED) | ✅ | ✅ | ❌ | ❌ | ❌ |

**Meetings**

| Permission | COORD | TECH | PR | POC | BLD |
|---|---|---|---|---|---|
| `create:meeting:project` | ✅ any | ✅ any | ⚠️ own project | ❌ | ❌ |
| `create:meeting:central` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create:meeting:builders` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage:meeting` (start, end, cancel, reschedule, MOM) | ✅ any | ✅ any | ⚠️ own project's meetings + ones they created | ⚠️ ones they created | ⚠️ ones they created |
| `manage:meeting:attendance` | ✅ any | ✅ any | ⚠️ own project's meeting; own project's volunteers in central meetings | ⚠️ central meetings (all); builders meetings they run | ⚠️ builders meetings they created |
| `lock:meeting` (early lock, unlock before finalise, finalise now) | ✅ | ✅ | ❌ | ❌ | ❌ |

**Access, hours, export, settings, system**

| Permission | COORD | TECH | PR | POC | BLD |
|---|---|---|---|---|---|
| `manage:roster` (grant/end posts, with the rules in 4.5 and 4.3) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `approve:hours` (set event hours, recompute) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `adjust:hours` (tagged extra hours) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:hours_types` (adjustment tags and default hours) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `export:csv:bounded` | ✅ all (not logged) | ✅ all (not logged) | ⚠️ own project's volunteers (logged) | ❌ | ❌ |
| `manage:settings` (FCFS window, export cap, edit budget, MOM days, absence years) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:settings:system` (retention days, audit caps, emergency hours, rate limits) | ✅ | ⚠️ Mentor only | ❌ | ❌ | ❌ |
| `manage:feature_flags` | ✅ | ⚠️ Mentor only | ❌ | ❌ | ❌ |
| `manage:emergency_access` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `run:maintenance` (rebuild counters, run the daily job now) | ✅ | ⚠️ Mentor only | ❌ | ❌ | ❌ |
| `request:retention_run` | n/a (runs it directly) | ⚠️ Mentor only | ❌ | ❌ | ❌ |
| `override:soft_rules` (Section 3.2) | ✅ | ✅ | ❌ | ❌ | ❌ |

### 5.2 What a Tech Mentor has that a Member does not

Mentors are 4th-year tech people who guide the team. They have everything a Member has, plus: `manage:settings:system`, `manage:feature_flags`, `run:maintenance`, `request:retention_run`, and the right to grant and end Tech Member posts (Section 4.5). Nothing else. They cannot suspend or delete volunteers either.

### 5.3 Extra rules

- Nobody (not even a Coordinator) can edit or delete audit rows through the app.
- Coordinators and Tech can take attendance for **any** event or meeting before the lock. After the lock only `correct:attendance`. Nothing is edited silently: every change is audited and post-lock changes need a reason.
- Builders (including POC and Domain Lead) can create central events and meetings and edit **only the ones they created**, only while the item is not locked, and inside the edit budget.
- `view:events:past:project`: any PR may see the **analytics** of their own project's past events, sees volunteer **details** only for volunteers of their own project, and name/roll/project for other projects' volunteers who took part in an event their project was part of.
- For central events a PR sees only their own project's volunteers. The cross-project BASIC view applies only to collaborating **project** events.
- A request-style action (`request:volunteer_action`) never changes data by itself. It only creates a row in `approval_requests`.

---

## 6. Field-level visibility of volunteer data

Two view levels. Both are enforced by **column lists in SQL**, not by hiding things in the UI.

| Level | Fields |
|---|---|
| **BASIC** | `rollNumber`, `name`, `project` |
| **FULL** | everything in `VolunteerDetail`: email, **gender**, phone, hostel, blood group, city/state, year, domains, all stats, hours, red-flag count, notes |

Who gets which:

| Viewer | Own-project volunteers | Other-project volunteers | Where |
|---|---|---|---|
| Coordinator / Tech | FULL | FULL | everywhere |
| PR | FULL | BASIC, **only** when that volunteer took part in a collaborating project event their project was part of | event pages |
| POC | n/a | BASIC | **central events only** |
| Other builders | none | none | n/a |
| Emergency pack (Section 4.9) | BASIC (or name/city edit for `PROJECT_EDIT_BASIC`) | none | emergency tasks page only |

Special fields: `phone`, `hostel`, `bloodGroup`, `gender`, `cityState`, `notes`, and red-flag reporter names are FULL-only. **Gender totals are fine in analytics** (counts and percentages, never names). Never put phone, blood group or gender per person in logs, URLs, charts or shared caches.

Office-bearer names (PRs, POCs, builders, tech, coordinators) are listed automatically on every event's attendance sheet (BASIC). If they are absent nothing is recorded, and it must not change any turnout percentage.

---

## 7. Domain model (relations at a glance)

```
projects (9, fixed) ─┬─< volunteers >─┬─< volunteer_domains
                     │                ├─< office_assignments   (roster + role history; PR slots)
                     │                ├─< red_flags
                     │                ├─< volunteer_year_hours (event + adjustment + legacy hours)
                     │                ├─< hours_adjustments >─ adjustment_types
                     │                └─< emergency_grants     (scoped to a project, event or meeting)
                     │
                     ├─< event_projects >─ events >─ event_participants >─ volunteers
                     │                       │  └──< attendance_corrections
                     │                       ├── event_categories   (default hours per type of event)
                     │                       ├── event_groups       (mega events / camps)
                     │                       └── import_batches     (old events brought in from files)
                     │
                     └─< meetings >─ meeting_attendance >─ volunteers
                                  └──< attendance_corrections

approval_requests (Tech → Coordinator) · audit_log (insert-only) · settings (key/value + flags)
rate_limits and idempotency_keys (small, unlogged, throw-away)
```

- `volunteers.roll_number` is the primary key of the person everywhere (text FK).
- Projects are never deleted. Volunteers are archived, and can be **permanently deleted** only through Section 11.13.
- Events and meetings are deleted only by the retention run (Section 11.14) or by undoing an import batch, and that cascades to their child rows.
- A system row `SYSTEM` in `volunteers` stands in for "imported record" and "removed person" (Appendix A.6).

---

## 8. Database schema (Postgres on Supabase)

Implement with Drizzle in `src/db/schema/*.ts`, matching this DDL **exactly** (names, types, constraints, indexes). Migrations are committed SQL generated by `drizzle-kit`. The extra SQL (RLS, roles, functions, cron) lives in `drizzle/manual/*.sql` and is applied by the admin role.

Conventions:

- Table and column names `snake_case`. TS property names `camelCase` (Drizzle maps them).
- `timestamptz` for instants, `date` for IST calendar days. `created_at` / `updated_at` are set by the app (`now()`), no triggers.
- Counters and "who" columns exist only where listed. Do not add more.
- Enums are Postgres enums. Never write a TS-only status with no DB enum, except the derived ones called out.
- Create tables in the order shown (foreign keys depend on it).

### 8.1 Enums

```sql
create type user_role          as enum ('COORDINATOR','TECH_TEAM','BUILDER','PROJECT_REPRESENTATIVE');
create type tech_kind          as enum ('MEMBER','MENTOR');
create type builder_kind       as enum ('GENERAL','POC','DOMAIN_LEAD');
create type access_status      as enum ('ACTIVE','SUSPENDED','REVOKED');
create type volunteer_status   as enum ('ACTIVE','SUSPENDED','ARCHIVED');
create type gender             as enum ('MALE','FEMALE','OTHER');
create type creative_domain    as enum ('PHOTOGRAPHY','VIDEO_EDITING','GRAPHIC_DESIGNING','CONTENT_WRITING');
create type blood_group        as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');
create type event_type         as enum ('CENTRAL','PROJECT');
create type participation_mode as enum ('FCFS','OPEN_TO_ALL');
-- ONGOING is NOT stored. It is derived from time (see 11.4). RESCHEDULED is reachable only from PUBLISHED.
create type event_status       as enum ('DRAFT','SCHEDULED','PUBLISHED','RESCHEDULED','COMPLETED','CANCELLED','ARCHIVED');
create type collab_approval    as enum ('PENDING','APPROVED','REJECTED');
create type participant_source as enum ('FCFS','WALK_IN','AUTO');
create type attendance_status  as enum ('PRESENT','ABSENT','EXCUSED');
create type meeting_type       as enum ('PROJECT','CENTRAL','BUILDERS');
create type meeting_status     as enum ('SCHEDULED','ONGOING','COMPLETED','CANCELLED','RESCHEDULED');
create type audit_outcome      as enum ('SUCCESS','FAILURE','DENIED');
create type request_kind       as enum ('VOLUNTEER_SUSPEND','VOLUNTEER_REINSTATE','VOLUNTEER_ARCHIVE','VOLUNTEER_DELETE','RETENTION_RUN');
create type request_status     as enum ('PENDING','APPROVED','REJECTED','CANCELLED','EXPIRED','FAILED');
create type emergency_pack     as enum ('PROJECT_VIEW_BASIC','PROJECT_EDIT_BASIC','EVENT_FCFS','EVENT_ATTENDANCE','MEETING_RUN');
create type import_kind        as enum ('VOLUNTEERS','HISTORY_EVENTS','HISTORY_HOURS');
```

"General Volunteering" is **not** an enum value. Every volunteer is implicitly a general volunteer; `creative_domain` lists only the four specialisations. (In TS, `Domain` adds `"GENERAL_VOLUNTEERING"` for filters and labels.)

### 8.2 Core tables

```sql
-- 9 rows, fixed ids, seeded (Appendix A.1). Not identity.
create table projects (
  id               smallint primary key,
  slug             text not null unique,
  name             text not null unique,
  sdgs             smallint[] not null,
  tagline          text not null default '',
  description      text not null default '',
  accent_color     text not null default '#64748b',
  last_activity_at timestamptz,               -- set when a finalised, non-imported event/meeting of this project happens (11.11)
  updated_at       timestamptz not null default now()
);

create table volunteers (
  -- The DB check is deliberately loose. The real pattern lives in src/config/identity.ts (ROLL_NUMBER_PATTERN)
  -- so it can be tightened later without a migration.
  roll_number      text primary key check (roll_number ~ '^[A-Za-z0-9]{4,20}$'),
  name             text not null check (char_length(name) between 2 and 100),
  gender           gender not null,                                      -- compulsory
  phone            text check (phone ~ '^[6-9][0-9]{9}$'),               -- optional, restricted visibility
  hostel           text check (char_length(hostel) <= 60),
  blood_group      blood_group,
  city_state       text check (char_length(city_state) <= 60),           -- optional, e.g. "Ranchi, Jharkhand"
  batch_year       smallint not null check (batch_year between 2000 and 2100),   -- admission year, e.g. 2024
  status           volunteer_status not null default 'ACTIVE',
  project_id       smallint references projects(id),                     -- null is fine for office staff; a data-quality issue for others
  join_date        date not null default current_date,
  notes            text check (char_length(notes) <= 1000),
  notes_updated_by text references volunteers(roll_number),
  notes_updated_at timestamptz,
  notes_edit_count smallint not null default 0,                          -- edit budget (11.2)
  -- cached counters (only touched by the functions in 11.10) --
  events_attended     integer not null default 0,   -- PRESENT in any event, any source
  events_fcfs_final   integer not null default 0,   -- FCFS rows finalised as PRESENT or ABSENT (EXCUSED excluded)
  events_fcfs_present integer not null default 0,   -- FCFS rows finalised PRESENT
  events_missed_fcfs  integer not null default 0,   -- FCFS rows finalised ABSENT (the "penalty" count)
  meetings_present    integer not null default 0,
  meetings_absent     integer not null default 0,
  allocated_hours     numeric(7,1) not null default 0,   -- sum of event + adjustment + legacy hours over all years
  red_flag_count      smallint not null default 0,       -- count of non-revoked red_flags
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
) with (fillfactor = 85);                                -- counters change a lot; leave room for in-place updates
create index volunteers_project_status_idx on volunteers (project_id, status);
create index volunteers_status_idx on volunteers (status);
```

`year` is **not stored**. It is computed: `year = academicYearStart(now) - batch_year + 1`, where the academic year starts on **1 July IST**. Example: batch 2024 in Oct 2026 → 2026 − 2024 + 1 = **3rd year**. Computed values outside 2–4 are possible (1st years, passed-out volunteers show 5 or more). That is fine; the type is a plain number.

`email` is **not stored**: always `${roll_number}@${EMAIL_DOMAIN}`, derived in the mapper.

```sql
create table volunteer_domains (
  roll_number text not null references volunteers(roll_number),
  domain      creative_domain not null,
  since       date not null default current_date,
  primary key (roll_number, domain)
);
create index volunteer_domains_domain_idx on volunteer_domains (domain);
```

```sql
-- The access roster AND the role history. Rows are never deleted by the app; ending a post sets ends_at.
create table office_assignments (
  id            integer generated always as identity primary key,
  roll_number   text not null references volunteers(roll_number),
  role          user_role not null,
  tech_kind     tech_kind,                       -- only for TECH_TEAM
  builder_kind  builder_kind,                    -- only for BUILDER
  project_id    smallint references projects(id),
  pr_slot       smallint check (pr_slot in (1,2)),
  domain        creative_domain,                 -- only for DOMAIN_LEAD
  access_status access_status not null default 'ACTIVE',
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz,
  granted_by    text not null references volunteers(roll_number),
  ended_by      text references volunteers(roll_number),
  end_reason    text check (char_length(end_reason) <= 300),
  created_at    timestamptz not null default now(),
  constraint oa_shape check (
    (role = 'PROJECT_REPRESENTATIVE' and project_id is not null and pr_slot is not null
       and tech_kind is null and builder_kind is null and domain is null)
    or (role = 'BUILDER' and builder_kind is not null and project_id is null and pr_slot is null
       and tech_kind is null and ((builder_kind = 'DOMAIN_LEAD') = (domain is not null)))
    or (role = 'TECH_TEAM' and tech_kind is not null and project_id is null and pr_slot is null
       and builder_kind is null and domain is null)
    or (role = 'COORDINATOR' and project_id is null and pr_slot is null
       and tech_kind is null and builder_kind is null and domain is null)
  )
);
-- one active row per person per role
create unique index oa_active_role_uq on office_assignments (roll_number, role) where ends_at is null;
-- exactly two PR slots per project, enforced by the database
create unique index oa_pr_slot_uq on office_assignments (project_id, pr_slot)
  where ends_at is null and role = 'PROJECT_REPRESENTATIVE';
create index oa_roll_active_idx on office_assignments (roll_number) where ends_at is null;
```

Access is valid only if `ends_at is null and access_status = 'ACTIVE'`. A person has at most one active BUILDER row, so only one builder kind at a time. If someone changes kind, end the old row and add a new one. Kind precedence when reading: `POC` > `DOMAIN_LEAD` > `GENERAL`.

```sql
create table red_flags (
  id           integer generated always as identity primary key,
  roll_number  text not null references volunteers(roll_number),
  reported_by  text not null references volunteers(roll_number),   -- reporter name is recorded
  reason       text not null check (char_length(reason) between 5 and 300),
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz,
  revoked_by   text references volunteers(roll_number)
);
create index red_flags_roll_idx on red_flags (roll_number);

-- Tech asks, Coordinator decides (Section 4.8). Decided rows are purged after 90 days by the daily job.
create table approval_requests (
  id             integer generated always as identity primary key,
  kind           request_kind not null,
  status         request_status not null default 'PENDING',
  target_rolls   text[] not null default '{}',     -- 1..200 volunteers; empty only for RETENTION_RUN
  params         jsonb not null default '{}',      -- e.g. {"olderThanMonths": 42}
  reason         text not null check (char_length(reason) between 10 and 300),
  requested_by   text not null references volunteers(roll_number),
  requested_at   timestamptz not null default now(),
  decided_by     text references volunteers(roll_number),
  decided_at     timestamptz,
  decision_note  text check (char_length(decision_note) <= 300),
  executed_at    timestamptz,
  error          text check (char_length(error) <= 300),
  check (cardinality(target_rolls) <= 200),
  check ((kind = 'RETENTION_RUN') = (cardinality(target_rolls) = 0))
);
create index approval_requests_pending_idx on approval_requests (requested_at) where status = 'PENDING';

-- One row per import run. It has NO "who" column on purpose (staff imports are not logged, 13.3).
-- It exists so an import of old events can be undone.
create table import_batches (
  id          integer generated always as identity primary key,
  kind        import_kind not null,
  row_counts  jsonb not null,                         -- e.g. {"events": 12, "attendance": 840, "skipped": 3}
  status      text not null default 'APPLIED' check (status in ('APPLIED','UNDONE')),
  created_at  timestamptz not null default now()
);
```

### 8.3 Events

```sql
create table event_categories (            -- "what kind of event" -> default hours. Editable data, not code.
  id             smallint generated always as identity primary key,
  name           text not null unique,
  default_hours  numeric(4,1) not null check (default_hours >= 0),
  is_active      boolean not null default true
);

create table event_groups (                -- mega event / camp that spans several events
  id                  integer generated always as identity primary key,
  title               text not null check (char_length(title) between 3 and 120),
  description         text not null default '' check (char_length(description) <= 1000),
  academic_year       smallint not null,
  full_hours          numeric(5,1),                -- hours when the volunteer meets min_events_for_full
  min_events_for_full smallint check (min_events_for_full >= 1),
  created_by          text not null references volunteers(roll_number),
  created_at          timestamptz not null default now(),
  check ((full_hours is null) = (min_events_for_full is null))
);

create table events (
  id                  integer generated always as identity primary key,
  title               text not null check (char_length(title) between 3 and 120),
  description         text not null default '' check (char_length(description) <= 2000),
  type                event_type not null,
  participation       participation_mode not null default 'FCFS',
  status              event_status not null default 'DRAFT',
  venue               text not null check (char_length(venue) between 2 and 160),
  starts_at           timestamptz not null,
  ends_at             timestamptz,
  fcfs_opens_at       timestamptz,
  fcfs_lock_at        timestamptz,              -- after this, PRs cannot add names (soft rule S-02)
  attendance_lock_at  timestamptz not null,     -- start of the next IST day after the event; locked when now() >= this (set by service)
  is_attendance_locked boolean not null default false,   -- manual early lock; effective lock also = now() >= attendance_lock_at
  locked_by           text references volunteers(roll_number),
  finalized_at        timestamptz,              -- set once when counters were applied (11.10)
  category_id         smallint references event_categories(id),
  group_id            integer references event_groups(id),
  counts_for_group    boolean not null default true,
  hours               numeric(4,1) check (hours >= 0),       -- filled later by Tech/Coordinators
  hours_approved_at   timestamptz,
  hours_approved_by   text references volunteers(roll_number),
  academic_year       smallint not null,        -- IST academic-year start of starts_at (set by service)
  reschedule_count    smallint not null default 0,
  edit_count          smallint not null default 0,           -- edit budget (11.2)
  cancellation_reason text check (char_length(cancellation_reason) <= 300),
  -- snapshots written once at finalise (11.10). They make analytics cheap and turnout correct.
  eligible_count      smallint,
  present_count       smallint,
  present_male        smallint,
  present_female      smallint,
  present_other       smallint,
  -- old events brought in from files (14.4)
  is_imported         boolean not null default false,
  import_batch_id     integer references import_batches(id) on delete set null,
  created_by          text not null references volunteers(roll_number),   -- 'SYSTEM' for imported events
  created_by_role     user_role,                                            -- null for imported events
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint events_participation_chk check (
    (participation = 'OPEN_TO_ALL' and type = 'CENTRAL' and fcfs_opens_at is null and fcfs_lock_at is null)
    or (participation = 'FCFS' and (fcfs_opens_at is null) = (fcfs_lock_at is null)
        and (fcfs_lock_at is null or (fcfs_lock_at > fcfs_opens_at and fcfs_lock_at <= starts_at)))
  ),
  constraint events_cancel_chk check (status <> 'CANCELLED' or cancellation_reason is not null),
  constraint events_hours_chk  check (hours_approved_at is null or hours is not null),
  constraint events_group_chk  check (group_id is null or type = 'CENTRAL'),
  constraint events_time_chk   check (ends_at is null or ends_at > starts_at)
);
create index events_starts_idx      on events (starts_at desc);
create index events_type_status_idx on events (type, status);
create index events_group_idx       on events (group_id) where group_id is not null;
create index events_year_idx        on events (academic_year);
create index events_batch_idx       on events (import_batch_id) where import_batch_id is not null;
```

Service rule on top of the CHECK: a **central** `FCFS` event must have both FCFS times set. A **project** event with no outside slots may have both null.

```sql
-- Which projects are involved in an event, and what slots they got.
create table event_projects (
  event_id        integer not null references events(id) on delete cascade,
  project_id      smallint not null references projects(id),
  is_host         boolean not null default false,       -- host/collaborating project (project events). false = slot-holder
  approval        collab_approval not null default 'APPROVED',
  approved_by     text references volunteers(roll_number),
  approved_at     timestamptz,
  slots_total     smallint check (slots_total >= 0),     -- max volunteers this project may enter (null for hosts). A guardrail, not a wall (S-01)
  cap_year2       smallint check (cap_year2 >= 0),       -- optional per-year limits inside slots_total
  cap_year3       smallint check (cap_year3 >= 0),
  cap_year4       smallint check (cap_year4 >= 0),
  fcfs_edit_count smallint not null default 0,           -- edit budget for this project's name list (11.2)
  primary key (event_id, project_id),
  check (is_host or approval = 'APPROVED')
);
create index event_projects_project_idx on event_projects (project_id);

create table event_participants (
  event_id    integer not null references events(id) on delete cascade,
  roll_number text not null references volunteers(roll_number),
  project_id  smallint references projects(id),          -- volunteer's project at the time
  source      participant_source not null,
  status      attendance_status not null default 'ABSENT', -- before the lock, ABSENT on FCFS/WALK_IN rows means "not marked yet"
  added_by    text not null references volunteers(roll_number),
  added_at    timestamptz not null default now(),
  marked_by   text references volunteers(roll_number),
  marked_at   timestamptz,
  primary key (event_id, roll_number),                    -- duplicate attendance is impossible
  check (source <> 'AUTO' or status <> 'ABSENT')          -- AUTO rows exist only once someone is marked PRESENT/EXCUSED
);
create index event_participants_roll_idx on event_participants (roll_number);
```

Which rows exist (this keeps the table small):

| Source | Meaning | Row created when |
|---|---|---|
| `FCFS` | A PR entered this volunteer from the FCFS list. | When the PR adds the name. Default `ABSENT`. |
| `WALK_IN` | Added by Coordinator/Tech after the FCFS lock (or beyond the slots). | When they add. |
| `AUTO` | Not FCFS-registered but eligible: host-project volunteers (project events), office bearers (every event), anyone (open-to-all central events). Old events brought in by import also use `AUTO` unless the file says `FCFS`. | **Only when marked** `PRESENT` or `EXCUSED`. Absent AUTO people have **no row**. |

### 8.4 Meetings

```sql
create table meetings (
  id                  integer generated always as identity primary key,
  type                meeting_type not null,
  project_id          smallint references projects(id),          -- required iff type = 'PROJECT'
  agenda              text not null check (char_length(agenda) between 3 and 500),
  meeting_date        date not null,                             -- IST calendar day
  start_time          time not null,
  end_time            time,
  venue               text not null check (char_length(venue) between 2 and 160),
  status              meeting_status not null default 'SCHEDULED',
  started_at          timestamptz,
  ended_at            timestamptz,
  mom                 text check (char_length(mom) <= 800),      -- Zod also enforces <= 100 words
  mom_by              text references volunteers(roll_number),
  mom_at              timestamptz,
  mom_edit_count      smallint not null default 0,               -- edit budget (11.2)
  edit_count          smallint not null default 0,               -- edit budget (11.2)
  attendance_lock_at  timestamptz not null,                      -- start of the next IST day after meeting_date (exclusive)
  is_attendance_locked boolean not null default false,
  finalized_at        timestamptz,
  -- snapshots written once at finalise (11.10)
  eligible_count      smallint,
  present_count       smallint,
  present_male        smallint,
  present_female      smallint,
  present_other       smallint,
  cancellation_reason text check (char_length(cancellation_reason) <= 300),
  created_by          text not null references volunteers(roll_number),
  created_by_role     user_role not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check ((type = 'PROJECT') = (project_id is not null)),
  check (status <> 'CANCELLED' or cancellation_reason is not null),
  check (end_time is null or end_time > start_time)
);
create index meetings_date_idx         on meetings (meeting_date desc);
create index meetings_project_date_idx on meetings (project_id, meeting_date desc) where project_id is not null;
create index meetings_type_date_idx    on meetings (type, meeting_date desc);

-- Only people who were present (or excused) get a row. Absent = no row (derived at finalise).
create table meeting_attendance (
  meeting_id  integer not null references meetings(id) on delete cascade,
  roll_number text not null references volunteers(roll_number),
  excused     boolean not null default false,         -- false = PRESENT, true = EXCUSED
  primary key (meeting_id, roll_number)
);
```

`meeting_attendance` is the biggest table by far, so it is deliberately tiny: no per-row timestamps, no per-row marker, one index (the PK). "Who ticked it" lives in the audit log (30 days). Volunteer-side lookups ("which meetings did X attend") go through `meetings` filters (project + central + dates) and then hit the PK.

### 8.5 Corrections and hours

```sql
-- Every post-lock change keeps the previous value. Never deleted by the app.
create table attendance_corrections (
  id            integer generated always as identity primary key,
  event_id      integer references events(id) on delete cascade,
  meeting_id    integer references meetings(id) on delete cascade,
  roll_number   text not null references volunteers(roll_number),
  old_status    attendance_status not null,
  new_status    attendance_status not null,
  reason        text not null check (char_length(reason) between 10 and 300),
  corrected_by  text not null references volunteers(roll_number),
  corrected_at  timestamptz not null default now(),
  check ((event_id is null) <> (meeting_id is null)),
  check (old_status <> new_status)
);
create index att_corr_event_idx   on attendance_corrections (event_id)   where event_id is not null;
create index att_corr_meeting_idx on attendance_corrections (meeting_id) where meeting_id is not null;

-- Tags for extra hours that do not come from events. Tech and Coordinators make the tags and set the
-- default hours, so everyone is treated the same ("Photographer at event" = 1 h, "Graphic design task" = 2 h ...).
create table adjustment_types (
  id             smallint generated always as identity primary key,
  name           text not null unique check (char_length(name) between 3 and 60),
  default_hours  numeric(4,1) not null check (default_hours <> 0),
  is_active      boolean not null default true
);

create table hours_adjustments (
  id            integer generated always as identity primary key,
  roll_number   text not null references volunteers(roll_number),
  type_id       smallint not null references adjustment_types(id),
  occurred_on   date not null,                        -- IST day the work happened
  academic_year smallint not null,                    -- set by the service from occurred_on
  hours         numeric(5,1) not null check (hours <> 0 and hours between -200 and 200),  -- starts at the tag's default, may be changed
  description   text not null check (char_length(description) between 10 and 300),
  event_id      integer references events(id) on delete set null,
  created_by    text not null references volunteers(roll_number),
  created_at    timestamptz not null default now()
);
-- A person can get the same tag many times, but not twice for the same day (and same event).
create unique index hours_adj_once_uq on hours_adjustments (roll_number, type_id, occurred_on, coalesce(event_id, 0));
create index hours_adj_roll_year_idx on hours_adjustments (roll_number, academic_year);

create table volunteer_year_hours (     -- one row per volunteer per academic year; survives event purge
  roll_number      text not null references volunteers(roll_number),
  academic_year    smallint not null,
  event_hours      numeric(6,1) not null default 0,   -- written ONLY by the recompute (11.9)
  adjustment_hours numeric(6,1) not null default 0,   -- written ONLY by the recompute (11.9)
  legacy_hours     numeric(6,1) not null default 0,   -- written ONLY by the hours import (14.4). The recompute never touches it.
  computed_at      timestamptz not null default now(),
  primary key (roll_number, academic_year)
);
```

### 8.6 System tables

```sql
create table audit_log (
  id             bigint generated always as identity primary key,
  at             timestamptz not null default now(),
  actor_roll     text,                               -- no FK on purpose: the record must survive anything. Null for an unknown identity (denied login)
  actor_role     user_role,                          -- highest role at that moment. Null for denied logins and emergency-only users
  action         text not null,                      -- AuditAction (text so new actions need no migration)
  entity_type    text not null,
  entity_id      text not null,
  entity_label   text check (char_length(entity_label) <= 120),
  target_roll    text,                               -- whose record was touched (single person)
  project_id     smallint,
  outcome        audit_outcome not null default 'SUCCESS',
  correlation_id uuid not null,
  reason         text check (char_length(reason) <= 300),
  summary        text not null check (char_length(summary) <= 280),  -- one concise human sentence
  changes        jsonb,                              -- minimal diff, max ~8 KB, no secrets, no phone/blood group/gender
  client_ip      inet                                -- only stored for FAILURE/DENIED
);
create index audit_at_idx     on audit_log (at desc);
create index audit_actor_idx  on audit_log (actor_roll, at desc);
create index audit_target_idx on audit_log (target_roll, at desc) where target_roll is not null;
create index audit_entity_idx on audit_log (entity_type, entity_id, at desc);

create table settings (
  key        text primary key,
  value      jsonb not null,
  updated_by text references volunteers(roll_number),
  updated_at timestamptz not null default now()
);
-- keys and defaults (Appendix A.4):
--   audit_retention_days 30 · audit_max_rows 50000 · fcfs_default_window_minutes 60 · max_collab_projects 3
--   export_max_rows 2000 · emergency_max_hours 24 · edit_budget_revisions 2 · mom_edit_days 7
--   meeting_absence_years [2,3] · request_expire_days 14 · audit_staff_csv false
--   retention_months 42 · retention_purged_before null (set by the first retention run)
--   flag.maintenance_mode false · flag.exports_enabled true · flag.fcfs_entry_enabled true · flag.read_only false
--   limits {}   (overrides for the numbers in Section 17; empty means "use src/config/limits.ts")

-- Narrow, short-lived help (Section 4.9). A grant is one pack for one project, event or meeting.
create table emergency_grants (
  id           integer generated always as identity primary key,
  roll_number  text not null references volunteers(roll_number),
  pack         emergency_pack not null,
  project_id   smallint references projects(id),
  event_id     integer references events(id) on delete cascade,
  meeting_id   integer references meetings(id) on delete cascade,
  reason       text not null check (char_length(reason) between 10 and 300),
  granted_by   text not null references volunteers(roll_number),
  starts_at    timestamptz not null default now(),
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  revoked_by   text references volunteers(roll_number),
  check (expires_at > starts_at and roll_number <> granted_by),
  check (
    (pack in ('PROJECT_VIEW_BASIC','PROJECT_EDIT_BASIC') and project_id is not null and event_id is null and meeting_id is null)
    or (pack = 'EVENT_FCFS'       and project_id is not null and event_id is not null and meeting_id is null)
    or (pack = 'EVENT_ATTENDANCE' and event_id is not null and meeting_id is null)
    or (pack = 'MEETING_RUN'      and meeting_id is not null and event_id is null and project_id is null)
  )
);
create index emergency_active_idx on emergency_grants (roll_number) where revoked_at is null;
-- The maximum length (emergency_max_hours) is checked by the service, not by the table, so it can change in Settings.

-- Throw-away helper tables for Section 17. UNLOGGED = no write-ahead log, cheap, emptied after a crash (that is fine).
create unlogged table rate_limits (
  bucket       text        not null,              -- 'r:2405793' reads, 'w:2405793' writes, 'x:2405793' exports ...
  window_start timestamptz not null,
  hits         integer     not null default 1,
  primary key (bucket, window_start)
) with (fillfactor = 70);

create unlogged table idempotency_keys (
  key        uuid primary key,
  actor_roll text not null,
  created_at timestamptz not null default now()
);
```

### 8.7 Database roles, RLS, functions and timeouts (`drizzle/manual/security.sql`)

```sql
-- 1) App role (password in Vercel env only). Not a superuser, not BYPASSRLS.
create role app_user login password '<<from secret store>>';
grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant usage, select on all sequences in schema public to app_user;
alter default privileges in schema public grant select, insert, update, delete on tables to app_user;
alter default privileges in schema public grant usage, select on sequences to app_user;

-- 2) Audit is insert/select only for the app
revoke update, delete, truncate on audit_log from app_user;

-- 3) Nothing is reachable through Supabase's public API keys
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- 4) RLS on every table. Only app_user has a policy (deny by default for everyone else).
--    Re-run this block after adding any table. A test fails if a public table has RLS off.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    if t <> 'audit_log' then
      execute format('create policy app_all on public.%I for all to app_user using (true) with check (true)', t);
    end if;
  end loop;
end $$;
create policy audit_read   on audit_log for select to app_user using (true);
create policy audit_insert on audit_log for insert to app_user with check (true);

-- 5) Keep one bad query from hurting everyone (the recompute and imports raise these with SET LOCAL)
alter role app_user set statement_timeout = '8s';
alter role app_user set lock_timeout = '3s';
alter role app_user set idle_in_transaction_session_timeout = '10s';

-- 6) The SYSTEM row (stands in for imported and removed records)
insert into volunteers (roll_number, name, gender, batch_year, status)
values ('SYSTEM', 'System (imported or removed records)', 'OTHER', 2000, 'ARCHIVED');
```

```sql
-- 7) Audit purge: by age AND by row count, run by pg_cron as the owner (not by the app)
create or replace function purge_audit_log() returns void
language plpgsql security definer set search_path = public as $$
declare
  days     int := coalesce((select (value #>> '{}')::int from settings where key = 'audit_retention_days'), 30);
  max_rows int := coalesce((select (value #>> '{}')::int from settings where key = 'audit_max_rows'), 50000);
begin
  delete from audit_log where at < now() - make_interval(days => days);
  -- size valve: if abuse filled the table inside the retention window, drop the oldest rows beyond the cap
  delete from audit_log
   where id <= (select id from audit_log order by id desc offset max_rows limit 1);
end $$;
revoke all on function purge_audit_log() from public, anon, authenticated, app_user;
select cron.schedule('audit-purge', '30 20 * * *', 'select purge_audit_log()');   -- 20:30 UTC = 02:00 IST daily
-- pg_cron must be enabled first: create extension if not exists pg_cron;
```

```sql
-- 8) Permanent delete of one volunteer (Section 11.13). Runs as the owner so it can also clean old audit rows.
--    EVERY foreign key that points at volunteers must be handled here. A test checks this list against pg_constraint.
create or replace function delete_volunteer_permanently(p_roll text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_roll = 'SYSTEM' then raise exception 'protected row'; end if;
  if exists (select 1 from office_assignments where roll_number = p_roll and ends_at is null) then
    raise exception 'volunteer still holds an active post';
  end if;
  if not exists (select 1 from volunteers where roll_number = p_roll and status = 'ARCHIVED') then
    raise exception 'volunteer must be archived first';
  end if;

  -- a) rows that belong to the person
  delete from event_participants      where roll_number = p_roll;
  delete from meeting_attendance      where roll_number = p_roll;
  delete from attendance_corrections  where roll_number = p_roll;
  delete from hours_adjustments       where roll_number = p_roll;
  delete from volunteer_year_hours    where roll_number = p_roll;
  delete from volunteer_domains       where roll_number = p_roll;
  delete from red_flags               where roll_number = p_roll;
  delete from emergency_grants        where roll_number = p_roll;
  delete from office_assignments      where roll_number = p_roll;

  -- b) "who did it" columns on other people's rows now point at SYSTEM
  update volunteers          set notes_updated_by  = 'SYSTEM' where notes_updated_by  = p_roll;
  update office_assignments  set granted_by        = 'SYSTEM' where granted_by        = p_roll;
  update office_assignments  set ended_by          = 'SYSTEM' where ended_by          = p_roll;
  update red_flags           set reported_by       = 'SYSTEM' where reported_by       = p_roll;
  update red_flags           set revoked_by        = 'SYSTEM' where revoked_by        = p_roll;
  update events              set created_by        = 'SYSTEM' where created_by        = p_roll;
  update events              set locked_by         = 'SYSTEM' where locked_by         = p_roll;
  update events              set hours_approved_by = 'SYSTEM' where hours_approved_by = p_roll;
  update event_groups        set created_by        = 'SYSTEM' where created_by        = p_roll;
  update event_projects      set approved_by       = 'SYSTEM' where approved_by       = p_roll;
  update event_participants  set added_by          = 'SYSTEM' where added_by          = p_roll;
  update event_participants  set marked_by         = 'SYSTEM' where marked_by         = p_roll;
  update meetings            set created_by        = 'SYSTEM' where created_by        = p_roll;
  update meetings            set mom_by            = 'SYSTEM' where mom_by            = p_roll;
  update attendance_corrections set corrected_by   = 'SYSTEM' where corrected_by      = p_roll;
  update hours_adjustments   set created_by        = 'SYSTEM' where created_by        = p_roll;
  update settings            set updated_by        = 'SYSTEM' where updated_by        = p_roll;
  update emergency_grants    set granted_by        = 'SYSTEM' where granted_by        = p_roll;
  update emergency_grants    set revoked_by        = 'SYSTEM' where revoked_by        = p_roll;
  update approval_requests   set requested_by      = 'SYSTEM' where requested_by      = p_roll;
  update approval_requests   set decided_by        = 'SYSTEM' where decided_by        = p_roll;
  update approval_requests   set target_rolls      = array_remove(target_rolls, p_roll) where p_roll = any(target_rolls);

  -- c) audit rows carry the roll number as plain text. Clean them (the one allowed exception to "insert-only").
  update audit_log set actor_roll  = 'SYSTEM' where actor_roll  = p_roll;
  update audit_log set target_roll = null     where target_roll = p_roll;

  delete from volunteers where roll_number = p_roll;
end $$;
revoke all on function delete_volunteer_permanently(text) from public, anon, authenticated;
grant execute on function delete_volunteer_permanently(text) to app_user;
```

Migrations run with the admin (`postgres`) connection, never with `app_user`. Immutability of the audit table by app code does not protect against a database superuser, and the two functions above are deliberate exceptions. Say so in `docs/AUDIT_POLICY.md`.

### 8.8 Relations and delete rules

| Child | Parent | On delete |
|---|---|---|
| `volunteers.project_id` | `projects` | restrict |
| `office_assignments.roll_number` and every other column pointing at `volunteers` | `volunteers` | restrict. Deleting a person goes only through `delete_volunteer_permanently()`. |
| `event_projects.event_id`, `event_participants.event_id`, `attendance_corrections.event_id`, `emergency_grants.event_id` | `events` | cascade (only the retention run and import undo delete events) |
| `meeting_attendance.meeting_id`, `attendance_corrections.meeting_id`, `emergency_grants.meeting_id` | `meetings` | cascade |
| `hours_adjustments.event_id` | `events` | set null |
| `events.import_batch_id` | `import_batches` | set null |
| `events.group_id`, `events.category_id`, `hours_adjustments.type_id` | `event_groups`, `event_categories`, `adjustment_types` | restrict (turn `is_active` off instead of deleting) |

### 8.9 Indexes: why these and no more

Every index costs space and write time on a 500 MB budget. The list above is complete. Do not add indexes "just in case". Add one only when `EXPLAIN` shows a real need and record it in `docs/DATABASE.md`. Name search uses `ILIKE` on about 1,700 rows, so no trigram index is needed. Gender and year counts scan the small `volunteers` table, so they need no index either.

---

## 9. Free-tier budget (storage, requests, CPU, connections)

### 9.1 Row volume and size at the planned load

Monthly: 180 project meetings + 20 central = **200 meetings**; 18 + 7 = **25 events**. Over the 42-month retention horizon (3.5 years): 8,400 meetings, 1,050 events.

Pessimistic attendance: a project meeting averages 70 present, a central meeting 600.

| Table | Rows in 3.5 years (pessimistic) | Approx size incl. index |
|---|---|---|
| `meeting_attendance` | (180×70 + 20×600) × 42 ≈ **1,030,000** | **≈ 75–85 MB** (≈ 76 bytes per row) |
| `meetings` | 8,400 | ≈ 4 MB |
| `event_participants` | ~1,050 events × ~100 ≈ 105,000 | ≈ 11 MB (budget 18 MB) |
| `events`, `event_projects` | 1,050 / ~5,000 | ≈ 1.5 MB |
| Imported old events and attendance (14.4) | ~300 events, ~25,000 rows | ≈ 3 MB |
| `attendance_corrections` | ~2,000 | ≈ 0.5 MB |
| `volunteers` (with archived, not yet deleted) | ~1,700 | ≈ 1.5 MB |
| `volunteer_domains`, `office_assignments`, `red_flags`, `hours_adjustments`, `volunteer_year_hours`, `approval_requests` | a few thousand to ~20,000 | ≈ 4 MB |
| `audit_log` (30 days, hard cap 50,000 rows) | usually ≤ 10,000 | ≈ 5 MB normal, **25 MB at the cap** |
| `rate_limits`, `idempotency_keys` (emptied daily) | small | < 1 MB |
| **App data total** | | **≈ 110–140 MB worst case** |
| Supabase system schemas (`auth`, etc.) | | ≈ 10–30 MB (measure after setup) |
| **Expected total at year 3.5** | | **≈ 140–170 MB of 500 MB (about a third)** |

Growth is about 25–35 MB per year. The design leaves roughly a 3× safety margin.

### 9.2 Why it stays small

- Meetings store **present-only** rows; absent is derived and only counted.
- Auto-listed people (host project, office bearers, open-to-all) get **no row** until marked.
- No per-row timestamps on `meeting_attendance`; no secondary index on it.
- Hours are **not** stored per volunteer per event. They are computed from `events.hours` + attendance and rolled into `volunteer_year_hours` (a few rows per volunteer).
- Rates, year, email, project status, ONGOING are derived, not stored.
- Counters on `volunteers` and snapshots on `events`/`meetings` make list pages and analytics cheap (no scans of the big tables).
- Audit retention is 30 days **and** 50,000 rows. Bulk actions write one audit row with a roll-number list, not one row each.
- Post-lock history that must outlive the audit purge lives in `attendance_corrections` (a business table).
- Volunteers who left can be deleted for good (Section 11.13). Old events and meetings are purged after 42 months (Section 11.14).

### 9.3 Request and CPU budget (Vercel Hobby)

Vercel Hobby gives 1,000,000 invocations and 4 Active CPU hours per month, and **pauses the project if either is exceeded** (Section 2.1). The design target is to stay under **about 40% of each**.

| Item | Target |
|---|---|
| Invocations per month | ≤ 400,000 |
| Active CPU per month | ≤ 1.6 hours |
| Average CPU per request | ≤ 40 ms. A heavy page (event sheet, analytics) ≤ 120 ms. |
| Starting estimate | ~100 users × ~30 page loads × 30 days ≈ 90,000 page loads. Each load can cost 2–3 invocations once RSC fetches, prefetches and server actions are counted. Target ≈ 200,000–270,000. |

What keeps us there (each item is a rule elsewhere in this file):

- Review → Confirm edit flow: the draft lives in the browser, only **Confirm** hits the server (Section 11.2).
- Row links in tables use `prefetch={false}` (Section 16.6).
- Shared aggregates are cached for minutes (Section 16.4). Client router cache keeps recently opened pages for 30 seconds.
- Per-user rate limits (Section 17) and the one Vercel firewall rule (17.2).
- Search boxes debounce by 300 ms and need at least 2 characters.
- Charts are lazy and drawn in the browser. CSV is streamed, bounded and not formatted in heavy loops.

Measure, do not guess: before launch run a scripted "busy day" in staging with Playwright (Section 20, test 37), read CPU per route from Vercel, and write the numbers in `docs/DATABASE.md`. Every week, someone from Tech looks at the Vercel Usage page. If any quota passes 60% in the first half of the month, switch on the stricter limits in Section 17.7 and find the busy route.

### 9.4 Guard rails

| Check | Threshold | Action |
|---|---|---|
| DB size (`pg_database_size`, in the daily job, shown on Settings) | **350 MB** warning, **425 MB** act | Set `flag.read_only` for everyone except Coordinator/Tech (soft read-only), run the retention tool (11.14). If still high, export old `meeting_attendance` to an encrypted file and delete it; counters stay valid. |
| Egress | watch the Supabase dashboard monthly | Bounded exports, small pages. |
| Idle pause | 7 days | Keep-alive in the daily job (Section 15). |
| Connections | 60 direct / 200 pooler | Pooler only, `max: 1`, `prepare: false`, short `idle_timeout`. |
| Vercel usage | 60% of any quota | Section 17.7. |

### 9.5 Query budget per request

Supabase Free has no per-query cap, but it has a small shared CPU and few connections. So: **few, indexed, set-based queries per page, run in parallel** (`Promise.all`).

| Request | Queries |
|---|---|
| Resolve `ActorContext` (every request, deduped with `React.cache`; also does the read-rate bump, 17.3) | **1**: one SQL that joins `volunteers`, active `office_assignments` and active `emergency_grants` (use `json_agg`) |
| Overview dashboard | 0–3 (cached aggregates, Section 16.4) |
| Volunteers list page | 2 (count + page of ≤ 50 rows, selected columns) |
| Volunteer profile | 3 (row + paginated events + paginated meetings) |
| Event page | 3 (event + projects/slots, participants page, counts) |
| Mark attendance (bulk) | 1 transaction: one multi-row upsert + one audit insert |
| FCFS name entry (bulk) | 1 transaction: row-lock the slot row, count, one multi-row insert, one audit insert |
| Finalise an event/meeting | 1 transaction of 3–4 set-based statements |

Never loop and `await` one query per volunteer. Always use multi-row `insert ... on conflict`, `update ... from`, `= any($1)`.

---

## 10. TypeScript types (`src/types/*`)

DB row types come from Drizzle (`typeof table.$inferSelect`). The types below are **API/DTO shapes** that services return to pages. IDs of events, meetings, groups, categories are `number`. Instants are ISO strings, dates are `"YYYY-MM-DD"` (IST days).

### 10.1 `auth.ts`

```ts
import type { ProjectId, CreativeDomain } from "./project";
import type { VolunteerBasic, VolunteerSummary } from "./volunteer";

export type UserRole = "COORDINATOR" | "TECH_TEAM" | "BUILDER" | "PROJECT_REPRESENTATIVE";
export type TechKind = "MEMBER" | "MENTOR";
export type BuilderKind = "GENERAL" | "POC" | "DOMAIN_LEAD";
export type AccessStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";

/** Rank. Used for display, "who may act on whom" and audit actor_role. NOT used to pick permissions. */
export type PostKind = "COORDINATOR" | "MENTOR" | "MEMBER" | "PR" | "POC" | "BUILDER";
export const POST_TIER: Record<PostKind, number> = {
  COORDINATOR: 5, MENTOR: 4, MEMBER: 3, PR: 2, POC: 2, BUILDER: 1,
};

export interface OfficeAssignment {      // = one row of office_assignments (roster + role history)
  id: number;
  rollNumber: string;
  role: UserRole;
  techKind: TechKind | null;             // only for TECH_TEAM
  builderKind: BuilderKind | null;       // only for BUILDER
  projectId: ProjectId | null;           // only for PROJECT_REPRESENTATIVE
  prSlot: 1 | 2 | null;                  // only for PROJECT_REPRESENTATIVE
  domain: CreativeDomain | null;         // only for DOMAIN_LEAD
  accessStatus: AccessStatus;
  startsAt: string;
  endsAt: string | null;
  grantedBy: string;
  endedBy: string | null;
  endReason: string | null;
}
export type RosterEntry = OfficeAssignment & { volunteer: VolunteerBasic };

export type EmergencyPack =
  | "PROJECT_VIEW_BASIC" | "PROJECT_EDIT_BASIC" | "EVENT_FCFS" | "EVENT_ATTENDANCE" | "MEETING_RUN";

export interface EmergencyScope {        // one active grant, as the resolver sees it
  grantId: number;
  pack: EmergencyPack;
  projectId: ProjectId | null;
  eventId: number | null;
  meetingId: number | null;
  expiresAt: string;
}

/** The ONLY thing authorization code looks at. Built on the server, per request, from the DB. */
export interface ActorContext {
  rollNumber: string;
  name: string;
  primaryRole: UserRole | null;          // highest post. null = emergency-only user
  tier: number;                          // POST_TIER of the highest post; 0 for emergency-only users
  roles: UserRole[];                     // all active roles
  techKind: TechKind | null;             // MENTOR beats MEMBER; null if not Tech
  builderKind: BuilderKind | null;       // highest active kind; null if not a builder
  projectScope: ProjectId[];             // PR projects; [] for everyone else
  permissions: PermissionAction[];       // UNION over all active posts (Section 4.3)
  emergency: EmergencyScope[];           // active scoped packs. Never merged into permissions
  correlationId: string;                 // uuid for this request, goes into audit and logs
}

/** Display shape for team pages. Never used for authorization. */
export interface StaffMember {
  details: VolunteerSummary;
  role: UserRole;
  techKind: TechKind | null;
  builderKind: BuilderKind | null;
  status: AccessStatus;
  createdAt: string;
}

export type PermissionAction =
  // viewing
  | "view:dashboard:organization" | "view:dashboard:project"
  | "view:volunteers:all" | "view:volunteers:project"
  | "view:event:central:assigned_volunteers" | "view:event:project:assigned_volunteers"
  | "view:events:scheduled_and_ongoing:all" | "view:events:past:all"
  | "view:events:past:central" | "view:events:past:project"
  | "view:analytics:cross_project" | "view:analytics:project" | "view:audit_logs"
  // volunteers
  | "create:volunteer" | "import:volunteers" | "import:history"
  | "edit:volunteer:details" | "edit:volunteer:affiliations" | "edit:volunteer:notes"
  | "flag:volunteer" | "revoke:red_flag"
  | "suspend:volunteer" | "reinstate:volunteer" | "archive:volunteer" | "delete:volunteer"
  | "request:volunteer_action" | "decide:request"
  // events
  | "create:event:central" | "create:event:project" | "edit:event" | "edit:event:after_fcfs_open"
  | "approve:event:collaboration" | "force:event:collaboration"
  | "manage:event:fcfs" | "edit:event:fcfs" | "manage:event:attendance"
  | "lock:event" | "correct:attendance"
  | "manage:event_groups" | "manage:event_categories" | "archive:year"
  // meetings
  | "create:meeting:project" | "create:meeting:central" | "create:meeting:builders"
  | "manage:meeting" | "manage:meeting:attendance" | "lock:meeting"
  // access, hours, export, system
  | "manage:roster" | "approve:hours" | "adjust:hours" | "manage:hours_types"
  | "export:csv:bounded"
  | "manage:settings" | "manage:settings:system" | "manage:feature_flags" | "manage:emergency_access"
  | "run:maintenance" | "request:retention_run" | "run:retention"      // run:retention = Coordinator only
  | "override:soft_rules";

export type ErrorCode =
  | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "CONFLICT"
  | "LOCKED" | "LIMIT_EXCEEDED" | "RATE_LIMITED" | "MAINTENANCE" | "READ_ONLY" | "INTERNAL";

/** Every server action returns this. Out-of-scope data -> NOT_FOUND. */
export type ActionResult<T> =
  | { ok: true; data: T; notice?: string }
  | { ok: false; error: {
      code: ErrorCode;
      message: string;                       // plain words a volunteer coordinator can read
      fieldErrors?: Record<string, string>;
      retryAfterSec?: number;                // RATE_LIMITED
      editsLeft?: number;                    // LIMIT_EXCEEDED from the edit budget
    } };
```

### 10.2 `project.ts`

```ts
export const PROJECT_NAMES = [
  "Bandhutva", "Dhara", "Nidaan", "Riddhi", "Sanyukt", "Sparsh", "Swet", "Udaan", "Urja",
] as const;
export type ProjectName = (typeof PROJECT_NAMES)[number];

export type ProjectId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;   // fixed seed ids (Appendix A.1)
export const PROJECT_ID_BY_NAME: Record<ProjectName, ProjectId> = {
  Bandhutva: 1, Dhara: 2, Nidaan: 3, Riddhi: 4, Sanyukt: 5, Sparsh: 6, Swet: 7, Udaan: 8, Urja: 9,
};

/** Only the four specialisations are stored. Everyone is implicitly a General Volunteer. */
export const CREATIVE_DOMAINS = ["PHOTOGRAPHY", "VIDEO_EDITING", "GRAPHIC_DESIGNING", "CONTENT_WRITING"] as const;
export type CreativeDomain = (typeof CREATIVE_DOMAINS)[number];
export type Domain = CreativeDomain | "GENERAL_VOLUNTEERING";   // for filters and labels only
export const DOMAIN_LABELS: Record<Domain, string> = {
  PHOTOGRAPHY: "Photography", VIDEO_EDITING: "Video Editing",
  GRAPHIC_DESIGNING: "Graphic Designing", CONTENT_WRITING: "Content Writing",
  GENERAL_VOLUNTEERING: "General Volunteering",
};

export interface ProjectRepresentative { rollNumber: string; name: string; slot: 1 | 2 }

export interface Project {
  id: ProjectId;
  name: ProjectName;
  slug: string;
  sdgs: number[];                       // e.g. [4, 17]; project events stay within these SDGs (advice, not enforced)
  tagline: string;
  description: string;
  accentColor: string;
  lastActivityAt: string | null;
  status: "ACTIVE" | "INACTIVE";        // DERIVED: lastActivityAt within the last 15 days
  activeVolunteersCount: number;        // DERIVED count of ACTIVE volunteers
  totalHoursLogged: number;             // DERIVED: sum of volunteer_year_hours of its volunteers (selected year)
  representatives: ProjectRepresentative[];   // 0-2 items (fewer = vacancy = data-quality issue)
  updatedAt: string;
}
// Events of a project are NOT embedded. Fetch them with a paginated query.

export interface DomainSummary {
  domain: CreativeDomain;
  description: string;
  activeCount: number;
  leads: VolunteerBasic[];              // >40 hours and 3+ months in the domain (advice for choosing leads)
  iconName: string;
}
import type { VolunteerBasic } from "./volunteer";
```

### 10.3 `volunteer.ts`

```ts
import type { CreativeDomain, ProjectName } from "./project";
import type { UserRole } from "./auth";

export type VolunteerStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export const GENDER_LABELS: Record<Gender, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };
export interface GenderCounts { male: number; female: number; other: number }

/** Computed from batchYear. Usually 2, 3 or 4, but can be 1 or 5+ (new joiners, passed-out people). */
export type AcademicYear = number;
export const yearLabel = (y: number) => (y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : `${y}th`);
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

/** BASIC level: what POCs, other projects' PRs and emergency packs may see. */
export interface VolunteerBasic {
  rollNumber: string;                    // PK, validated by ROLL_NUMBER_PATTERN in src/config/identity.ts
  name: string;
  project: ProjectName | null;
}

/** Raw counters stored on volunteers. Rates are derived from these. */
export interface VolunteerStats {
  eventsAttended: number;                // PRESENT in any event, any source
  eventsFcfsFinal: number;               // finalised FCFS rows, PRESENT or ABSENT
  eventsFcfsPresent: number;
  eventsMissedFcfs: number;              // finalised FCFS rows ABSENT (penalty list size)
  meetingsPresent: number;
  meetingsAbsent: number;
}

/** List-row shape (FULL viewers). */
export interface VolunteerSummary extends VolunteerBasic {
  email: string;                         // DERIVED `${rollNumber}@${EMAIL_DOMAIN}`
  gender: Gender;                        // compulsory, FULL-only
  status: VolunteerStatus;
  year: AcademicYear;                    // DERIVED
  domains: CreativeDomain[];             // may be empty (= general volunteer only)
  officeRole: UserRole | null;           // highest active post, if any
  eventsAttendedCount: number;
  attendanceRateMeetings: number | null; // DERIVED: present / (present + absent) * 100, 1 decimal, null if 0 meetings
  attendanceRateEvents: number | null;   // DERIVED: eventsFcfsPresent / eventsFcfsFinal * 100, null if 0
  allocatedHours: number;
  redFlagsCount: number;
}

/** Profile shape (FULL viewers). */
export interface VolunteerDetail extends VolunteerSummary {
  phone: string | null;                  // restricted
  cityState: string | null;              // optional
  hostel: string | null;
  bloodGroup: BloodGroup | null;
  batchYear: number;
  joinDate: string;
  notes: string | null;
  notesUpdatedBy: string | null;
  notesUpdatedAt: string | null;
  notesEditsLeft: number | null;         // edit budget (11.2); null for people who are exempt
  stats: VolunteerStats;
  createdAt: string;
  updatedAt: string;
}

/**
 * The old arrays (EventsAttended, MeetingsPresent, ...) are NOT fields on the volunteer.
 * They are separate paginated queries:
 */
export type VolunteerHistoryKind =
  | "EVENTS_ATTENDED"           // event_participants where status = PRESENT
  | "EVENTS_MISSED_AFTER_FCFS"  // source = FCFS, status = ABSENT, event finalised
  | "EVENTS_REGISTERED_FCFS"    // source = FCFS, event not finalised and not CANCELLED (upcoming)
  | "MEETINGS_PRESENT"          // meeting_attendance, excused = false
  | "MEETINGS_ABSENT";          // derived: eligible finalised meetings with no attendance row

export interface RedFlag {
  id: number;
  rollNumber: string;
  reportedBy: VolunteerBasic;   // reporter is recorded and shown to FULL viewers only
  reason: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface VolunteerFilterState {
  search?: string;                                   // name ILIKE or roll prefix
  project?: ProjectName | "ALL";
  domain?: CreativeDomain | "ALL";
  status?: VolunteerStatus | "ALL";
  gender?: Gender | "ALL";
  year?: number | "ALL";
  sortBy?: "name" | "rollNumber" | "eventsAttended" | "hours" | "attendanceRate" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page: number;                                      // 1-based
  pageSize: number;                                  // max 50
}
```

### 10.4 `event.ts`

```ts
import type { UserRole } from "./auth";
import type { ProjectId, ProjectName } from "./project";
import type { VolunteerBasic, VolunteerSummary, GenderCounts } from "./volunteer";

export type EventType = "CENTRAL" | "PROJECT";
export type ParticipationMode = "FCFS" | "OPEN_TO_ALL";        // OPEN_TO_ALL only for CENTRAL

export type StoredEventStatus =
  "DRAFT" | "SCHEDULED" | "PUBLISHED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
/** ONGOING is computed by effectiveEventStatus(); it is never written to the DB. */
export type EventStatus = StoredEventStatus | "ONGOING";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";
export type ParticipantSource = "FCFS" | "WALK_IN" | "AUTO";
export type CollabApproval = "PENDING" | "APPROVED" | "REJECTED";

export interface EventProjectSlot {
  projectId: ProjectId;
  projectName: ProjectName;
  isHost: boolean;                       // true = host/collaborating project
  approval: CollabApproval;              // hosts other than the creator's start as PENDING
  approvedBy: string | null;
  approvedAt: string | null;
  slotsTotal: number | null;             // slot-holders only. A guardrail (S-01), not a wall
  capYear2: number | null;               // optional per-year limits
  capYear3: number | null;
  capYear4: number | null;
  filled: number;                        // current FCFS/WALK_IN rows for this project
  editsLeft: number | null;              // edit budget for this project's name list; null = exempt viewer
}

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  type: EventType;
  participation: ParticipationMode;
  status: EventStatus;                   // effective (derived) status
  venue: string;
  startsAt: string;
  endsAt: string | null;
  fcfsOpensAt: string | null;
  fcfsLockAt: string | null;
  isFcfsOpen: boolean;                   // DERIVED: PUBLISHED/RESCHEDULED && now in [opens, lock)
  attendanceOpensAt: string;             // startsAt - 15 minutes
  attendanceLockAt: string;              // start of the next IST day (exclusive)
  isAttendanceLocked: boolean;           // DERIVED: stored flag OR now >= attendanceLockAt
  isFinalized: boolean;
  needsReview: boolean;                  // DERIVED: locked, not finalised, and nobody ever marked attendance (11.7)
  category: { id: number; name: string } | null;
  group: { id: number; title: string } | null;
  countsForGroup: boolean;
  hours: number | null;                  // assigned later
  hoursApproved: boolean;
  academicYear: number;
  projects: EventProjectSlot[];
  createdBy: VolunteerBasic | null;      // null for imported events
  createdByRole: UserRole | null;
  rescheduleCount: number;
  editsLeft: number | null;              // edit budget of the event details; null = exempt viewer
  cancellationReason: string | null;
  registeredCount: number;               // FCFS + WALK_IN rows
  eligibleCount: number | null;          // snapshot at finalise
  presentCount: number | null;           // snapshot at finalise (office bearers excluded)
  genderPresent: GenderCounts | null;    // snapshot at finalise
  isImported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  eventId: number;
  volunteer: VolunteerBasic | VolunteerSummary;   // level depends on viewer (Section 6)
  source: ParticipantSource;
  status: AttendanceStatus;
  addedBy: string;
  addedAt: string;
  markedBy: string | null;
  markedAt: string | null;
}

export type MeetingType = "PROJECT" | "CENTRAL" | "BUILDERS";
export type MeetingStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface Meeting {
  id: number;
  type: MeetingType;
  project: ProjectName | null;           // required for PROJECT
  agenda: string;
  date: string;                          // "YYYY-MM-DD" IST
  startTime: string;                     // "HH:mm" IST
  endTime: string | null;
  venue: string;
  status: MeetingStatus;
  startedAt: string | null;
  endedAt: string | null;
  mom: string | null;                    // max 100 words
  momBy: string | null;
  momEditsLeft: number | null;
  editsLeft: number | null;
  isAttendanceLocked: boolean;           // DERIVED: stored flag OR now >= attendanceLockAt
  attendanceLockAt: string;
  isFinalized: boolean;
  needsReview: boolean;                  // DERIVED: locked, not finalised, no attendance rows
  eligibleCount: number | null;          // snapshot at finalise
  presentCount: number | null;
  genderPresent: GenderCounts | null;
  cancellationReason: string | null;
  createdBy: VolunteerBasic;
  createdByRole: UserRole;
  createdAt: string;
  updatedAt: string;
}
// The attendee list is NOT inside Meeting. Fetch it with a paginated query.

export interface AttendanceCorrection {
  id: number;
  attendanceFor: "EVENT" | "MEETING";
  entityId: number;
  rollNumber: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;                        // min 10 chars
  correctedBy: string;
  correctedAt: string;
}

export interface AttendanceSummary {
  attendanceFor: "EVENT" | "MEETING";
  entityId: number;
  totalEligible: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  turnoutPercentage: number | null;      // see 12.2; office bearers excluded
  isLocked: boolean;
}

export interface EventFilterState {
  search?: string; type?: EventType | "ALL"; status?: EventStatus | "ALL";
  project?: ProjectName | "ALL"; groupId?: number; startDate?: string; endDate?: string;
  page: number; pageSize: number;        // max 50
}
export interface MeetingFilterState {
  type?: MeetingType | "ALL"; project?: ProjectName | "ALL"; status?: MeetingStatus | "ALL";
  startDate?: string; endDate?: string; page: number; pageSize: number;
}
```

### 10.5 `hours.ts`

```ts
export interface EventCategory { id: number; name: string; defaultHours: number; isActive: boolean }

export interface EventGroup {
  id: number;
  title: string;
  description: string;
  academicYear: number;
  fullHours: number | null;              // hours awarded when minEventsForFull is met
  minEventsForFull: number | null;
  eventIds: number[];
}

/** A tag made by Tech/Coordinators, with preset hours, so everyone is treated the same. */
export interface AdjustmentType { id: number; name: string; defaultHours: number; isActive: boolean }

export interface HoursAdjustment {
  id: number; rollNumber: string; typeId: number; typeName: string;
  occurredOn: string;                    // IST day
  academicYear: number; hours: number;
  description: string; eventId: number | null; createdBy: string; createdAt: string;
}

export interface VolunteerYearHours {
  rollNumber: string; academicYear: number;
  eventHours: number; adjustmentHours: number; legacyHours: number;
  total: number;                         // event + adjustment + legacy
  computedAt: string;
}
```

### 10.6 `requests.ts` and `imports.ts`

```ts
export type RequestKind =
  "VOLUNTEER_SUSPEND" | "VOLUNTEER_REINSTATE" | "VOLUNTEER_ARCHIVE" | "VOLUNTEER_DELETE" | "RETENTION_RUN";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "FAILED";

export interface ApprovalRequest {
  id: number; kind: RequestKind; status: RequestStatus;
  targets: VolunteerBasic[];             // names for the Coordinator's screen (1-200)
  params: Record<string, unknown>;
  reason: string;
  requestedBy: VolunteerBasic; requestedAt: string;
  decidedBy: VolunteerBasic | null; decidedAt: string | null; decisionNote: string | null;
  executedAt: string | null; error: string | null;
}

export type ImportKind = "VOLUNTEERS" | "HISTORY_EVENTS" | "HISTORY_HOURS";
export interface ImportRowIssue { row: number; field?: string; message: string }
export interface ImportPreview {
  kind: ImportKind;
  validRows: number; duplicateRows: number; errorRows: number;
  issues: ImportRowIssue[];              // first 100 only
  willCreate: Record<string, number>;    // e.g. { volunteers: 120 } or { events: 12, attendance: 840 }
  token: string;                         // short-lived (15 min) token that ties Confirm to this exact preview
}
```

### 10.7 `audit.ts`

```ts
import type { UserRole } from "./auth";
import type { ProjectName } from "./project";

export type AuditAction =
  // volunteers
  | "VOLUNTEER_CREATE" | "VOLUNTEER_UPDATE" | "VOLUNTEER_STATUS_CHANGE"
  | "VOLUNTEER_SUSPEND" | "VOLUNTEER_REINSTATE" | "VOLUNTEER_ARCHIVE" | "VOLUNTEER_DELETE"
  | "PROJECT_AFFILIATION_CHANGE" | "DOMAIN_MEMBERSHIP_CHANGE" | "VOLUNTEER_NOTE_UPDATE"
  | "RED_FLAG_ADD" | "RED_FLAG_REVOKE"
  // requests
  | "REQUEST_CREATE" | "REQUEST_APPROVE" | "REQUEST_REJECT" | "REQUEST_CANCEL"
  // access
  | "ROLE_GRANT" | "ROLE_REVOKE" | "STAFF_SUSPEND" | "LOGIN_DENIED"
  | "EMERGENCY_ACCESS_GRANT" | "EMERGENCY_ACCESS_REVOKE"
  // events
  | "EVENT_CREATE" | "EVENT_UPDATE" | "EVENT_PUBLISH" | "EVENT_RESCHEDULE" | "EVENT_CANCEL"
  | "EVENT_COLLAB_APPROVE" | "EVENT_COLLAB_REJECT" | "EVENT_COLLAB_FORCE"
  | "EVENT_LOCK" | "EVENT_UNLOCK" | "EVENT_FINALIZE" | "EVENT_ARCHIVE"
  | "FCFS_ENTRY" | "FCFS_EDIT" | "FCFS_REMOVE" | "EDIT_BUDGET_GRANT"
  | "EVENT_GROUP_CHANGE" | "EVENT_CATEGORY_CHANGE"
  // attendance
  | "ATTENDANCE_MARK" | "ATTENDANCE_CORRECT"
  // meetings
  | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_START" | "MEETING_END" | "MEETING_CANCEL"
  | "MEETING_RESCHEDULE" | "MEETING_MOM" | "MEETING_ATTENDANCE_MARK" | "MEETING_LOCK" | "MEETING_UNLOCK" | "MEETING_FINALIZE"
  // hours
  | "HOURS_APPROVE" | "HOURS_ADJUST" | "HOURS_RECOMPUTE" | "HOURS_TYPE_CHANGE"
  // system
  | "CSV_EXPORT"            // PR exports only (Coordinator/Tech exports are not logged, 13.3)
  | "FEATURE_FLAG_CHANGE" | "SETTINGS_CHANGE" | "RETENTION_RUN" | "COUNTERS_REBUILD" | "CRON_RUN"
  | "RATE_LIMIT_TRIP" | "IMPORT_UNDO";

export type AuditEntityType =
  | "VOLUNTEER" | "PROJECT" | "EVENT" | "MEETING" | "ATTENDANCE" | "FCFS" | "HOURS"
  | "ROSTER" | "STAFF" | "REQUEST" | "EXPORT" | "SYSTEM";

export type AuditOutcome = "SUCCESS" | "FAILURE" | "DENIED";

export interface AuditLogEntry {
  id: string;                      // bigint as string
  at: string;
  actorRoll: string | null;
  actorName: string | null;        // joined from volunteers at read time
  effectiveRole: UserRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel?: string;
  targetRoll?: string;
  targetName?: string;
  projectContext?: ProjectName;
  outcome: AuditOutcome;
  correlationId: string;
  reason?: string;
  summary: string;                 // one concise sentence: who did what to whom/what
  changes?: Record<string, unknown>;   // minimal diff, never phone / blood group / gender / tokens
}

export interface AuditFilterState {
  search?: string; action?: AuditAction | "ALL"; entityType?: AuditEntityType | "ALL";
  role?: UserRole | "ALL"; outcome?: AuditOutcome | "ALL"; project?: ProjectName | "ALL";
  actorRoll?: string; targetRoll?: string; startDate?: string; endDate?: string;
  page: number; pageSize: number;  // max 50
}
```

Good audit `summary` lines (short but full of information):

- `PR Urja 2405123 added 12 volunteers to FCFS of "Mega Blood Camp" (Urja 12/15).`
- `Tech 2405793 corrected attendance of 2505777 in "Plantation Drive": ABSENT → PRESENT. Reason: arrived late, PR confirmed.`
- `Coord 2328051 granted PR (Dhara, slot 2) to 2405456.`
- `Tech 24051698 asked to archive 38 volunteers (request #14).`
- `Coord 2306220 approved request #14: 38 volunteers archived.`

### 10.8 `analytics.ts`

```ts
import type { CreativeDomain, ProjectName } from "./project";
import type { GenderCounts } from "./volunteer";

export type AnalyticsScope =
  | { kind: "ORG" }                                  // Coordinator / Tech
  | { kind: "PROJECT"; projectIds: number[] };       // PRs (from ActorContext, never from the client)

export interface MetricCardData {
  title: string; value: number | string;
  change?: number; changeType?: "increase" | "decrease" | "neutral"; changePeriod?: string; description?: string;
}

/** Counts plus shares. Shares are computed from counts, one decimal. null when total is 0. */
export interface GenderBreakdown extends GenderCounts { total: number; femalePercent: number | null; malePercent: number | null; otherPercent: number | null }

export interface VolunteerMetrics {
  total: number; active: number; suspended: number; archived: number;
  newThisMonth: number; averageAttendanceRate: number | null;
  gender: GenderBreakdown;                           // over ACTIVE volunteers in scope
  byYear: { year: number; count: number; gender: GenderBreakdown }[];
}

export interface HoursMetrics {
  totalAllocated: number;      // sum of volunteer_year_hours.total for the selected year
  totalFromEvents: number; totalFromAdjustments: number; totalFromLegacy: number;
  eventsAwaitingApproval: number;   // COMPLETED, non-imported events without hours_approved_at
}

export interface EventMetrics {
  totalEvents: number; completedEvents: number; scheduledEvents: number; cancelledEvents: number;
  centralEventsCount: number; projectEventsCount: number; upcomingThisMonth: number;
  genderPresent: GenderBreakdown;                    // sum of the finalised events' snapshots
}

export interface MeetingMetrics {
  totalMeetings: number; completedMeetings: number; projectMeetings: number;
  centralMeetings: number; buildersMeetings: number; averageTurnout: number | null;
  genderPresent: GenderBreakdown;
}

export interface ProjectAnalyticsSummary {
  projectName: ProjectName; slug: string;
  volunteersCount: number; activeVolunteersCount: number;
  eventsCount: number; meetingsCount: number;
  hoursCompleted: number; attendanceRate: number | null;
  status: "ACTIVE" | "INACTIVE";
  prNames: string[];
  gender: GenderBreakdown;
}

export interface DomainAnalyticsSummary {
  domain: CreativeDomain; memberCount: number; percentageOfTotal: number;
  overlapWith: { domain: CreativeDomain; count: number }[];
  gender: GenderBreakdown;
}

export interface MonthlyTrendPoint {
  month: string;               // "2026-09" (IST month)
  eventsCount: number; meetingsCount: number;
  volunteersPresent: number; attendanceRate: number | null; hoursCompleted: number;
  genderPresent: GenderCounts;
}

export interface DataQualityIssue {
  id: string;
  type:
    | "MISSING_PROJECT" | "PROJECT_PR_VACANCY" | "UNAPPROVED_HOURS" | "UNLOCKED_PAST_EVENT"
    | "ATTENDANCE_NOT_TAKEN" | "MISSING_MOM" | "MISSING_PHONE" | "STALE_VOLUNTEER"
    | "ROTATION_DUE" | "PASSED_OUT_NOT_ARCHIVED" | "OLD_PENDING_REQUEST" | "STUCK_DRAFT_EVENT";
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  affectedCount: number;
  targetUrl: string;           // internal URL with filters, never contains personal data
}

export interface DashboardSummary {
  scope: AnalyticsScope["kind"];
  academicYear: number;
  volunteers: VolunteerMetrics;
  hours: HoursMetrics;
  events: EventMetrics;
  meetings: MeetingMetrics;
  projectSummaries: ProjectAnalyticsSummary[];       // ORG: 9 rows; PROJECT: only their own
  domainSummaries: DomainAnalyticsSummary[];         // ORG only
  monthlyTrends: MonthlyTrendPoint[];
  dataQualityIssues: DataQualityIssue[];
  lastUpdated: string;
}
```

### 10.9 `index.ts` and config files

```ts
export * from "./auth"; export * from "./project"; export * from "./volunteer"; export * from "./event";
export * from "./hours"; export * from "./requests"; export * from "./audit"; export * from "./analytics";
```

Constants live in **three config files**, shown in full in Appendix C. Nothing else may hold these values.

| File | Holds | Why it is separate |
|---|---|---|
| `src/config/identity.ts` | `EMAIL_DOMAIN`, `ROLL_NUMBER_PATTERN`, roll-number hint text, helpers | Roll numbers have no known fixed pattern yet. When one is found, change it **here only**. |
| `src/config/app.ts` | timezone, locale, academic-year start month, window lengths, name lists, page sizes | Product rules that rarely change. |
| `src/config/limits.ts` | every rate limit, size cap and quota (Section 17), plus the default for each `settings` key | So limits are one file to read and one table to edit in Settings. |

---

## 11. Business rules and workflows

### 11.1 Time rules (use `src/lib/time.ts` only)

- `startOfNextDayIST(instant)`: midnight IST at the end of that IST day, as an instant. Locks use this, and a lock applies when `now() >= lock_at` (no "23:59:59" edge cases).
- `academicYearStart(instant)`: year number (1 July to 30 June, IST).
- `volunteerYear(batchYear, now)` = `academicYearStart(now) - batchYear + 1`.
- Attendance window for an event: **opens at `starts_at − 15 minutes`** (S-04), **locks at the start of the next IST day** after the event's last day. The last day is the IST day of `ends_at` if that is later than the IST day of `starts_at`, otherwise the day of `starts_at`. So an event that runs past midnight still works.
- Screens say "locks at midnight (12:00 am) IST".
- MOM window and edit windows use the same helpers.

### 11.2 Edit budget and the Review → Confirm flow (S-03)

**What it is.** A PR, POC or Builder can save changes to the same record only a few times. The default is **2 saved changes after the first save** (`edit_budget_revisions`). The first save is free. It keeps data tidy, makes people check before saving, and cuts needless writes.

**Where it applies**

| Record | Counter | First save is free when | Applies to |
|---|---|---|---|
| Event details, time, slots (before FCFS opens) | `events.edit_count` | the event is created | creator PR, POC, Builder |
| One project's FCFS name list in one event | `event_projects.fcfs_edit_count` | the project has no FCFS names yet | PR |
| Meeting details and time | `meetings.edit_count` | the meeting is created | creator, PR |
| MOM | `meetings.mom_edit_count` | the MOM is empty | creator, PR |
| Volunteer notes | `volunteers.notes_edit_count` | the notes are empty | PR |

**Where it does not apply**

- Attendance marking. People arrive over time, so marking happens in many small saves. It is protected by the window, the lock, no-op detection and the rate limits (Section 17).
- Anything a Coordinator or Tech member does. They are exempt (soft rule S-03) and fix mistakes. Their changes are still audited.
- Cancelling, creating and status changes.
- A change that changes nothing. It is skipped and not counted.

**How it works**

1. The person edits the form. Nothing is sent to the server while they type.
2. They press **Review**. The screen shows what will change (old → new) and this notice:
   > You can change this **{n} more time(s)**. After that, only a Coordinator or Tech member can change it. Check everything, then press **Confirm**.
3. They press **Confirm and save**. The server action receives `confirmed: true`, `expectedEditCount` (the count the form was opened with) and an `idempotencyKey`.
4. The server checks, in this order: rate limit, permission and scope, `confirmed === true`, `expectedEditCount` equals the stored counter (otherwise `CONFLICT`: "Someone saved this before you. Reload and look again."), the budget is not used up (otherwise `LIMIT_EXCEEDED` with `editsLeft: 0`), then it saves and adds 1 to the counter only if something really changed.
5. The result carries the new `editsLeft`, and a toast says "Saved. {n} change(s) left."
6. When the budget is 0 the Edit button becomes **Ask a Coordinator or Tech member**. Coordinators and Tech see **Give 2 more edits** (resets the counter to 0, reason required, audit `EDIT_BUDGET_GRANT`).

A FCFS "change" means one confirmed submission that changes the list (adds and removes together count as one).

### 11.3 Creating an event

Who: see Section 5 (`create:event:central`, `create:event:project`).

Fields: title, description, venue, `startsAt`, optional `endsAt`, category (optional; gives default hours), group (central only), participation mode, FCFS opens/lock times, per-project slots (+ optional per-year caps), collaborating projects.

Rules:

1. **Central event.** Created by a Coordinator, Tech, PR, POC or any builder. Two shapes:
   - **FCFS central event**: `participation = 'FCFS'`, FCFS times required, slots per project (how many students are needed from each project). Only FCFS people can be entered. **No automatic additions** of volunteers. Office bearers are still shown on the sheet.
   - **Open-to-all central event**: `participation = 'OPEN_TO_ALL'`. No FCFS. Every ACTIVE volunteer can be marked.
2. **Project event.** Created by a PR for **their own project**, or by a Coordinator/Tech for any project. It can be hosted by 1, 2 or 3 projects (`max_collab_projects`, S-09). To add other projects the PR switches on **collaboration**.
   - **Host-project volunteers are automatically eligible** (source `AUTO`, no FCFS for them).
   - FCFS entry is only for **other projects** that were given slots.
   - Event topics should follow the project's SDGs (advice, not enforced).
3. **Collaboration approval.** Every invited host project's PR (**either** of the two) approves (`approve:event:collaboration`). The event stays `DRAFT` until **all** hosts are `APPROVED`, then moves to `SCHEDULED` by itself. A `REJECTED` host sends the event back to the creator (still DRAFT; the creator may edit or remove that host). If an approval is stuck, a Coordinator or Tech member can force-approve with a reason (S-08).
4. **Slots.** `slots_total` per project and optional `cap_year2/3/4` ("only N second-years and M third-years may give names"). A cap can never exceed `slots_total`. Slots are guardrails for PRs, not a wall: Coordinators and Tech can add people beyond them with a reason (S-01).
5. **FCFS window.** `fcfs_opens_at` and `fcfs_lock_at`. Lock = open + `fcfs_default_window_minutes` (default 60), **copied into the event at creation** so later changes to the default do not touch existing events. Coordinators/Tech can set it per event. Must satisfy `fcfs_lock_at <= starts_at`.
6. `academic_year` and `attendance_lock_at` are computed by the service, never taken from the client.
7. Creating is protected by an idempotency key and the creation limits in Section 17 (max 20 creates a day, max 10 open drafts per person).
8. Audit: `EVENT_CREATE`. The first save is free of the edit budget.

### 11.4 Event status machine

Stored statuses: `DRAFT, SCHEDULED, PUBLISHED, RESCHEDULED, COMPLETED, CANCELLED, ARCHIVED`. **`ONGOING` is derived.** `RESCHEDULED` is reachable **only from `PUBLISHED`**.

| From → To | Trigger | Who | Conditions |
|---|---|---|---|
| (new) → `DRAFT` | create | creator | n/a |
| `DRAFT` → `SCHEDULED` | "Schedule", or automatically when the last host approval arrives | creator / system | all required fields valid; all hosts `APPROVED` |
| `SCHEDULED` → `PUBLISHED` | "Publish" (can be done together with Schedule) | creator, Tech, Coordinator | opens FCFS entry (when its window starts) |
| `SCHEDULED` → `SCHEDULED` | time change before publishing | creator, Tech, Coordinator | recompute `attendance_lock_at`; `reschedule_count += 1` |
| `PUBLISHED` → `RESCHEDULED` | time change | creator (before FCFS opens; counts as an edit), Tech, Coordinator (any time before start) | recompute `attendance_lock_at`; `reschedule_count += 1`; the FCFS window must still end before the start |
| any non-final → `CANCELLED` | cancel | creator (before FCFS opens), Tech, Coordinator | reason required; no more edits or attendance |
| `PUBLISHED`/`RESCHEDULED` → `COMPLETED` | finalise (11.10) after the lock | system / Tech / Coordinator | attendance locked and started (11.7) |
| `COMPLETED` → `ARCHIVED` | "Archive year" | Tech, Coordinator | no condition on hours (retention needs approved hours, 11.14) |

Derived: `effectiveEventStatus()` returns `ONGOING` when the stored status is `PUBLISHED`/`RESCHEDULED`, `now ≥ starts_at − 15 min` and the attendance is not locked.

Visibility: `DRAFT` is visible to the creator, pending approvers (PRs of invited projects), Tech and Coordinators. Everything from `SCHEDULED` on is visible to all office roles (`view:events:scheduled_and_ongoing:all`). Builders can see future scheduled events.

**FCFS name entry is allowed only when the stored status is `PUBLISHED` or `RESCHEDULED`.** `SCHEDULED` means "approved but not opened to PRs yet".

### 11.5 FCFS name entry

The portal does not run FCFS. A PR copies names from the outside FCFS result.

1. Allowed for a PR of project P (either PR), only for **volunteers whose `project_id = P` and who are `ACTIVE`**, only while `fcfs_opens_at ≤ now < fcfs_lock_at`, only if `flag.fcfs_entry_enabled`, only if P has a slot row for this event, and only if the event is `PUBLISHED` or `RESCHEDULED`.
2. Input: a list of roll numbers (paste or pick, **max 100 per submission**). It goes through Review → Confirm (11.2). Service, in one transaction:
   - lock the `event_projects` row for (event, P) with `SELECT ... FOR UPDATE`;
   - count existing `FCFS` + `WALK_IN` rows of P; check `slots_total` and each year cap (year from `batch_year`);
   - skip duplicates and report them ("already on the list");
   - one multi-row insert with `source = 'FCFS'`, `status = 'ABSENT'`, `on conflict do nothing`;
   - rows that do not fit are **not** added, and the message says so ("12 of 15 added, 3 are over the slot limit. Ask a Coordinator or Tech member to add the rest.");
   - one audit row `FCFS_ENTRY` listing the added roll numbers.
3. Removing a name before the lock: same PR, in the same Review → Confirm submission. Audit `FCFS_REMOVE`.
4. Edit budget: the first submission is free, then 2 changes (11.2).
5. After `fcfs_lock_at`: **PRs, POCs and Builders cannot change the list.** Only Coordinators and Tech can add (`WALK_IN`) or remove, with a short reason, up to the end of the event day, even beyond slots (S-01, S-02). Audit `FCFS_EDIT`.
6. Slot counts and year caps: editable by the creator before FCFS opens; once it opens, only Coordinators/Tech.
7. Central FCFS: only volunteers entered here appear for attendance (plus office bearers). Nothing is auto-added.
8. Open-to-all central event: no FCFS entry at all.
9. If two PRs of the same project save at the same moment, the row lock makes one wait. If it waits longer than 3 seconds the second gets `CONFLICT`: "Someone else is saving this list. Try again in a moment."
10. The `EVENT_FCFS` emergency pack follows exactly the same checks.

### 11.6 Attendance for events

Who appears on the sheet:

- Always: the PRs of every involved project, POCs, builders, Tech and Coordinators are **listed automatically** (source `AUTO`, BASIC). If absent, nothing is recorded and no percentage changes.
- Project event: host-project volunteers (AUTO) + FCFS rows of other projects.
- Central FCFS event: FCFS rows only.
- Central open-to-all event: every ACTIVE volunteer can be marked (search with at least 2 characters, paginated sheet of 50).

Who can mark: see Section 5. Coordinators/Tech any event; PRs for events of their own project (all participants) and for their own project's volunteers in other events; POCs for all volunteers in **central** events. The `EVENT_ATTENDANCE` emergency pack for its one event.

Window: marking opens **15 minutes before** `starts_at` (S-04) and ends at the lock. Coordinators/Tech may mark any time before the lock.

Marking behaviour (one transaction, one audit row `ATTENDANCE_MARK` with the roll lists; **max 500 rolls per call**):

- Bulk upsert on `(event_id, roll_number)`. Duplicates are impossible.
- Rows whose status would not change are skipped (no-op detection).
- `FCFS`/`WALK_IN` rows: set status `PRESENT` / `ABSENT` / `EXCUSED`.
- `AUTO` people: marking `PRESENT`/`EXCUSED` inserts the row; marking back to absent deletes the row.
- Set `marked_by`, `marked_at`.

A **Print sheet** button prints the participant list (name, roll, project, empty tick box) for days when the portal is down (Section 19.4).

### 11.7 Lock, unlock, finalise, review and corrections

**Locked** means `is_attendance_locked = true` **or** `now() >= attendance_lock_at`.

- **Early lock** (`lock:event`): sets `is_attendance_locked` and `locked_by`. It does **not** finalise. It can be reversed (`EVENT_UNLOCK`) by Coordinators/Tech while the event is not finalised **and** `now() < attendance_lock_at`. After the time lock, only corrections.
- **Finalise** (11.10) happens in three ways: the daily job, lazily when someone opens a past, locked, unfinalised event (guarded by an advisory lock so 50 simultaneous opens finalise once), or **Finalise now** (`lock:event`). It only runs if attendance was **started**.
- **Attendance started** = at least one `event_participants` row has `marked_at` set, **or** a Coordinator/Tech locked it by hand (they decided it was done).
- **Needs review.** If a locked event has no marked rows and was not locked by hand, it is not finalised automatically. It shows in the data-quality panel as `ATTENDANCE_NOT_TAKEN`. A Coordinator or Tech member picks one: **Finalise without penalties** (marks it completed and applies no counters at all), **Finalise as is** (applies counters; FCFS people count as absent), or **Cancel** (reason required). This stops a forgotten sheet from penalising everyone.
- **Corrections after the lock** (`correct:attendance`, Coordinators/Tech only, reason of at least 10 characters). One transaction: insert `attendance_corrections(old, new, reason, by)`, change the participant row (insert for walk-in additions, delete for `AUTO` → ABSENT), adjust counters by the delta **only if `finalized_at` is not null** (before finalise nothing has been counted yet, so there is nothing to adjust), audit `ATTENDANCE_CORRECT`. Previous values are never lost. If the event's hours were already approved, the affected volunteers' hours are recomputed straight away (11.9).
- The same "only if finalised" rule applies to walk-ins added after the FCFS lock.

### 11.8 Meetings

Three kinds:

| Type | Created by | Who is eligible | Visible attendee list |
|---|---|---|---|
| `PROJECT` | PR (own project), Coordinator, Tech | ACTIVE volunteers of that project | that project only |
| `CENTRAL` | PR, POC, Builder, Coordinator, Tech | all ACTIVE volunteers | all |
| `BUILDERS` | PR, POC, Builder, Coordinator, Tech | holders of active `BUILDER` or `PROJECT_REPRESENTATIVE` posts | builders + PRs |

PRs are part of builders, so they can create all three kinds (a project meeting only for their own project).

Lifecycle: `SCHEDULED` → `ONGOING` ("Start meeting") → `COMPLETED` ("End meeting"). A meeting can also be created and started at once ("Start now"). `CANCELLED` needs a reason. A time or date change sets `RESCHEDULED` (it can still be started). These meeting statuses are **stored** (explicit user actions), unlike events.

Attendance:

- Markable while `ONGOING` or `COMPLETED`, until `attendance_lock_at` (start of the next IST day after `meeting_date`). Coordinator/Tech can lock early and unlock before finalise (`lock:meeting`).
- Stored as present-only rows (`excused = true` for excused). Marking someone absent deletes their row. Max 500 rolls per call, no-op rows skipped.

MOM (minutes):

- **Max 100 words** (Zod counts words; the DB limits 800 characters).
- Written only after the meeting is `COMPLETED`. Creator and the PR of that project can write or edit it until the end of the day `meeting_date + mom_edit_days` (default 7). **Coordinators and Tech can write or edit it any time** (S-06).
- Edit budget applies to creator/PR: first write free, then 2 changes. Audit `MEETING_MOM`.

Who is counted absent at finalise (all conditions must be true):

1. The volunteer is in the meeting's audience (table above).
2. `status = 'ACTIVE'` and `join_date <= meeting_date`.
3. Their computed year is in `meeting_absence_years`. **Default `[2,3]`.** 4th years are busy with placements. They are counted **present** when they come, and are **never counted absent**. Change the setting if the team decides otherwise. [DECISION D-20]
4. They do not hold an active `COORDINATOR` or `TECH_TEAM` post. Those people are never counted absent.
5. They have no row in `meeting_attendance` for this meeting.

Stuck meetings:

- The daily job **auto-completes** a meeting that is still `ONGOING` after its lock (`ended_at` = the lock time), so it can be finalised.
- A meeting that was never started and whose day has passed is **not finalised**. It shows as "Not held?" in the data-quality panel (`ATTENDANCE_NOT_TAKEN`). A Coordinator/Tech cancels it or marks attendance.
- A `COMPLETED` meeting with **no attendance rows** is also **needs review**. Same three choices as for events (finalise without penalties, finalise as is, cancel).
- Meetings use the same edit budget for their details and time (11.2).

### 11.9 Mega events (groups) and hours

Some central events are parts of a big drive (Special Camp, Recruitment) that runs over several days with several events.

- `event_groups` holds the camp: `full_hours` and `min_events_for_full` (example: 50 hours if the volunteer attends at least 2 of the 7 events).
- Each event of the camp has `group_id` and a normal `category_id` / `hours` (the general hours for that kind of event).
- `events.counts_for_group = false` leaves one event out of the "minimum events" count.

**Hours formula**, per volunteer, per academic year. Only events with `hours_approved_at IS NOT NULL` and status not `CANCELLED` count, and only where the **participant's** status is `PRESENT` (EXCUSED earns nothing):

1. Events **not** in a group: add `events.hours` for each attended event.
2. Events in a group `g`: let `n` = number of attended events of `g` with `counts_for_group = true`.
   - If `g.full_hours` is set and `n ≥ g.min_events_for_full`, the volunteer gets **`full_hours` once for the whole group**. This *replaces* the sum of the individual events.
   - Otherwise the sum of `hours` of the attended events of `g`.
3. Add all `hours_adjustments` of that year.
4. Add `legacy_hours` of that year (from the hours import, 14.4).

Example (previous year): slum visit 4 h, orphanage visit 5 h. Attends only slum → 4. Only orphanage → 5. Both, and the camp rule is "2 of 7 → 50 h" → **50**, not 9. [DECISION D-09: full hours replace the sum even when the sum is bigger.]

Default hours per event category are **data** in `event_categories` (Appendix A.2). Coordinators/Tech edit them (`manage:event_categories`).

**Approving hours** (`approve:hours`, normally at the end of the year, but allowed any time):

1. Open "Hours approval" for an academic year. It lists COMPLETED, non-imported events. Each row is prefilled with the category default. Tech/Coordinator edits and approves (`hours`, `hours_approved_at`, `hours_approved_by`). Audit `HOURS_APPROVE` (one row per bulk save, with event ids and values).
2. Press **Recompute**. The service runs `recomputeHours(academicYear)` (below), which updates `volunteer_year_hours` and then `volunteers.allocated_hours`, in one transaction. Audit `HOURS_RECOMPUTE`. After this, volunteer pages and analytics show the new hours.
3. A correction to attendance in an approved event recomputes only the affected volunteers straight away (same SQL with an extra `roll_number = any(:rolls)` filter in `present`, `adj` and the first `update`).

**Tagged extra hours** (`adjust:hours`). Hours that do not come from events (a photographer at an event, a graphic design task, a position held). Tech and Coordinators make the **tags** (`adjustment_types`) with a default number of hours (`manage:hours_types`), so everyone is treated the same.

- To add hours: pick one or more volunteers (up to 100 at once, for example every photographer at an event), pick the tag, the date, and write a short description. Hours start at the tag's default and may be changed.
- A volunteer can get the same tag many times, but **not twice for the same day and event** (unique index). The screen says "already added for that day".
- Audit `HOURS_ADJUST` (one row per bulk save). Included in the next recompute, or recomputed straight away for those volunteers.
- Tags are never deleted, only deactivated.

Reference SQL for the recompute (per academic year `:y`). It is one transaction. Take the advisory lock first, and raise the timeout with `set local statement_timeout = '30s'`.

```sql
select pg_advisory_xact_lock(hashtext('recompute-hours'));

-- 1) zero what the recompute owns for this year, so people who lost hours (for example after a correction)
--    do not keep old numbers. legacy_hours is never touched here.
update volunteer_year_hours
   set event_hours = 0, adjustment_hours = 0, computed_at = now()
 where academic_year = :y;

-- 2) rebuild event hours + adjustment hours
with present as (
  select p.roll_number, e.group_id, e.hours, e.counts_for_group
    from event_participants p
    join events e on e.id = p.event_id
   where p.status = 'PRESENT' and e.academic_year = :y
     and e.hours_approved_at is not null and e.status <> 'CANCELLED'
),
plain as (
  select roll_number, sum(hours) as h from present where group_id is null group by roll_number
),
grouped as (
  select pr.roll_number, g.id as group_id, g.full_hours, g.min_events_for_full,
         count(*) filter (where pr.counts_for_group) as n_counted,
         sum(pr.hours) as sum_hours
    from present pr join event_groups g on g.id = pr.group_id
   group by pr.roll_number, g.id, g.full_hours, g.min_events_for_full
),
group_h as (
  select roll_number,
         sum(case when full_hours is not null and n_counted >= min_events_for_full
                  then full_hours else sum_hours end) as h
    from grouped group by roll_number
),
ev as (
  select coalesce(a.roll_number, b.roll_number) as roll_number,
         coalesce(a.h, 0) + coalesce(b.h, 0) as event_hours
    from plain a full join group_h b on a.roll_number = b.roll_number
),
adj as (
  select roll_number, sum(hours) as h
    from hours_adjustments where academic_year = :y group by roll_number
),
merged as (
  select coalesce(ev.roll_number, adj.roll_number) as roll_number,
         coalesce(ev.event_hours, 0) as event_hours,
         coalesce(adj.h, 0)          as adjustment_hours
    from ev full join adj on adj.roll_number = ev.roll_number
)
insert into volunteer_year_hours (roll_number, academic_year, event_hours, adjustment_hours, computed_at)
select roll_number, :y, event_hours, adjustment_hours, now() from merged
on conflict (roll_number, academic_year)
do update set event_hours = excluded.event_hours,
              adjustment_hours = excluded.adjustment_hours,
              computed_at = now();

-- 3) the one place allocated_hours is written
update volunteers v
   set allocated_hours = s.total, updated_at = now()
  from (select roll_number, sum(event_hours + adjustment_hours + legacy_hours) as total
          from volunteer_year_hours group by roll_number) s
 where s.roll_number = v.roll_number
   and v.allocated_hours is distinct from s.total;
```

Never recompute a year whose event details were purged by the retention run. Its `volunteer_year_hours` rows are frozen history. The tool refuses and says why.

### 11.10 Finalising and counters (the only place counters change)

Counters change only in these functions, all in `src/features/*/counters.ts`: `finalizeEvent`, `finalizeMeeting`, `correctAttendance`, `addRedFlag` / `revokeRedFlag`, `recomputeHours`, `applyHistoryImport`, `rebuildCounters`.

**`finalizeEvent(id)`**: idempotent, one transaction, only if `finalized_at IS NULL`, status is not `CANCELLED`, the event is locked, and attendance was started (11.7). Take `pg_try_advisory_xact_lock(hashtext('finalize:event:' || id))` first. If it returns false, someone else is doing it: skip.

1. Set `is_attendance_locked = true` (if not already), status `COMPLETED`, `finalized_at = now()`.
2. Apply counters to volunteers (one set-based statement; there is one row per person, so no grouping is needed):

```sql
with agg as (
  select roll_number,
         (status = 'PRESENT')::int                         as attended,
         (source = 'FCFS' and status = 'PRESENT')::int     as fcfs_present,
         (source = 'FCFS' and status = 'ABSENT')::int      as fcfs_missed
    from event_participants where event_id = :id
)
update volunteers v set
       events_attended     = v.events_attended + a.attended,
       events_fcfs_present = v.events_fcfs_present + a.fcfs_present,
       events_missed_fcfs  = v.events_missed_fcfs + a.fcfs_missed,
       events_fcfs_final   = v.events_fcfs_final + a.fcfs_present + a.fcfs_missed,
       updated_at = now()
  from agg a
 where a.roll_number = v.roll_number
   and (a.attended + a.fcfs_present + a.fcfs_missed) > 0;
```

   - `FCFS` + `EXCUSED` counts nowhere. `WALK_IN` and `AUTO` never enter the FCFS rate; they only add to `events_attended` when present.
3. Write the snapshots on the event (`snapshotEvent(id)`), using these definitions:
   - An **office bearer** is a person with an active office assignment at finalise time. A bearer is excluded from the snapshot **only when their row source is `AUTO`**. A bearer who was entered through FCFS or as a walk-in is a normal participant.
   - `eligible_count` = (`FCFS` + `WALK_IN` rows that are not `EXCUSED`) + (the AUTO pool: for a project event, ACTIVE non-bearer volunteers of the host projects; for an open-to-all event, all ACTIVE non-bearer volunteers; for a central FCFS event, none).
   - `present_count` = `PRESENT` rows inside that same population. `present_male/female/other` split `present_count` by gender.
   - For imported events `eligible_count` stays null (not known) and turnout shows "n/a".
4. Update `projects.last_activity_at` for every host project (and the creator's project) when the event is a **non-imported project event**.

**`finalizeMeeting(id)`**: same idempotency (advisory lock `finalize:meeting:<id>`). Status must be `COMPLETED`, the meeting locked, and at least one attendance row must exist (11.8).

1. `meetings_present += 1` for each row with `excused = false`.
2. Count absence for the absence-eligible set (rules 1–5 in 11.8):

```sql
update volunteers v set meetings_absent = v.meetings_absent + 1, updated_at = now()
 where v.status = 'ACTIVE' and v.roll_number <> 'SYSTEM'
   and v.join_date <= :meeting_date
   and (:academic_year - v.batch_year + 1) = any(:absence_years)          -- settings.meeting_absence_years
   and (  :type = 'CENTRAL'
       or (:type = 'PROJECT'  and v.project_id = :project_id)
       or (:type = 'BUILDERS' and exists (
             select 1 from office_assignments b
              where b.roll_number = v.roll_number and b.role in ('BUILDER','PROJECT_REPRESENTATIVE')
                and b.access_status = 'ACTIVE' and b.starts_at < :day_end
                and (b.ends_at is null or b.ends_at > :day_start))))
   and not exists (select 1 from office_assignments s
                    where s.roll_number = v.roll_number and s.role in ('COORDINATOR','TECH_TEAM') and s.ends_at is null)
   and not exists (select 1 from meeting_attendance m where m.meeting_id = :id and m.roll_number = v.roll_number);
```

3. Snapshots: the eligible set `E` = the absence-eligible set plus everyone who has an attendance row. `eligible_count` = `|E|` minus excused people. `present_count` = rows with `excused = false`. Gender counts split `present_count`.
4. Set `finalized_at`. Update `projects.last_activity_at` for `PROJECT` meetings.

**Post-lock correction**: apply the same rules as **deltas** (old status removed, new status added) inside the correction transaction, and only if the item is already finalised (11.7). Never recompute everything for one fix.

**Red flags**: add/revoke updates `red_flag_count` in the same transaction.

**Rebuild counters** (`run:maintenance`, audited `COUNTERS_REBUILD`): recomputes counters from the detail tables to repair drift. It has two modes. **Check** shows the differences and changes nothing. **Fix** writes them. Once a retention run has happened (`settings.retention_purged_before` is set), Fix is allowed only for volunteers who joined **after** that date, because older detail is gone and the stored counters are then the only record. Imported events count as detail.

**Derived rates** (one function, `computeRates(stats)`, nowhere else):

- `attendanceRateMeetings = meetingsPresent / (meetingsPresent + meetingsAbsent) × 100`, one decimal, `null` if the denominator is 0.
- `attendanceRateEvents = eventsFcfsPresent / eventsFcfsFinal × 100`, one decimal, `null` if 0. It is restricted to FCFS-registered, finalised, non-excused events so it can never go above 100.

### 11.11 Project activity

`status = ACTIVE` if `last_activity_at ≥ now − 15 days`, else `INACTIVE`. Computed on read; never stored. Imported events do not move `last_activity_at`.

### 11.12 Red flags and notes

- PRs (own project's volunteers), Coordinators and Tech can add a red flag with a reason. The reporter is stored and shown to FULL viewers. Revoking needs Coordinator/Tech. The counter on the volunteer updates in the same transaction.
- Notes: PRs (own project, inside the edit budget), Coordinators, Tech. The last editor and time are stored on the volunteer; history lives in the audit log (the audit row says "notes updated", never the text).

### 11.13 Volunteer lifecycle

```
ACTIVE ⇄ SUSPENDED          (Coordinator; Tech by request)
ACTIVE / SUSPENDED → ARCHIVED   (Coordinator; Tech by request)
ARCHIVED → ACTIVE           (reinstate: Coordinator; Tech by request)
ARCHIVED → deleted for good (Coordinator; Tech by request)
```

- **Nothing is automatic.** In particular, 4th years do **not** become inactive on their own. Many are busy with placements, but they can still attend events and earn hours. A Coordinator archives people when they have really left.
- **Suspended** volunteers cannot log in (if they hold a post), cannot be entered in new FCFS lists, and are not counted absent. Archived volunteers are hidden from default lists and from analytics (analytics counts them only under "archived").
- **Passed-out helper.** The data-quality panel lists ACTIVE volunteers whose computed year is 5 or more (`PASSED_OUT_NOT_ARCHIVED`), with a button for a bulk archive (Coordinator) or a bulk request (Tech), max 200 at a time. People who still hold an active post are skipped and shown.
- **Permanent delete** (`delete:volunteer`): only for `ARCHIVED` volunteers with no active post. It calls `delete_volunteer_permanently(roll)` (Section 8.7) for each person inside one transaction. It removes the person's attendance, hours, flags and posts, points "who did it" columns at `SYSTEM`, and cleans their roll number out of old audit rows. Events and meetings keep their stored totals (`present_count` and so on) and other people's counters do not change. The Coordinator types the number of people to confirm ("DELETE 12"). The audit row stores only the **count** and the request id, never the roll numbers. It cannot be undone, and old weekly backups still hold the person until they rotate out (Section 19.2). Max 50 people per action.
- Every one of these actions has a reason, and is audited (`VOLUNTEER_SUSPEND`, `VOLUNTEER_REINSTATE`, `VOLUNTEER_ARCHIVE`, `VOLUNTEER_DELETE`). When Tech asks, the flow is Section 4.8.
- Review the institute's rules and India's Digital Personal Data Protection Act, 2023 before launch (Section 16.3).

### 11.14 Retention and archival

| Data | Rule |
|---|---|
| Events (with participants and collaboration rows), including imported ones | Kept `retention_months` (default **42**, range 24–120, `manage:settings:system`). A **retention run** deletes older events **only if** their academic year is final: no COMPLETED non-imported event of that year without approved hours, and a recompute ran after the last approval. The tool checks this and refuses with the reasons. |
| Meetings and their attendance | Same horizon. Counters on volunteers already hold the totals. |
| What a retention run does | Chunks of 100 events per transaction (to stay inside timeouts), idempotent, sets `settings.retention_purged_before`, audit `RETENTION_RUN` with counts. Coordinator runs it (`run:retention`) or approves a Mentor's request. Export what you need first. |
| Audit log | 30 days **and** 50,000 rows, whichever is smaller. Purged by `pg_cron`, not by the app. `audit_retention_days` range 7–365. |
| `attendance_corrections`, `hours_adjustments`, `volunteer_year_hours`, `red_flags`, `import_batches` | Kept (tiny). |
| `approval_requests` | Decided ones deleted after 90 days. |
| `rate_limits`, `idempotency_keys` | Deleted after 1 day by the daily job. |
| Volunteers | Never removed automatically. Archive and delete are Coordinator decisions (11.13). |

---

## 12. Analytics and reporting

### 12.1 Rules

- Every analytics query takes an `AnalyticsScope` built from `ActorContext` (never from client input). PR scope adds `project_id = any($projectIds)` in SQL.
- One date convention: academic year (1 July to 30 June, IST), selectable. "This month" uses IST calendar months.
- Read counters, snapshots and small tables. Heavy aggregates over `meeting_attendance` are avoided by using `meetings.present_count` / `eligible_count` and the gender snapshots.
- Org and project dashboards are served from the shared aggregate cache (Section 16.4), 5 minutes. Cached values hold counts and ids only.
- Charts and tables in analytics never contain names, phone numbers, blood groups or a person's gender. Only counts and percentages.
- `SYSTEM` and archived volunteers are left out unless a metric says "archived".

### 12.2 Formulas

| Metric | Formula |
|---|---|
| Volunteers total / active / suspended / archived | counts by `volunteers.status` (scope applied, `SYSTEM` excluded) |
| New this month | `join_date` in the current IST month |
| **Gender ratio** | counts of `MALE`, `FEMALE`, `OTHER` among **ACTIVE** volunteers in scope; share = count / total × 100, one decimal; `null` when total is 0. Also by project, by year, and by domain. |
| Project volunteer count | `count(*) group by project_id` |
| Domain membership | `count(*) from volunteer_domains group by domain`; overlap = volunteers present in two domains |
| Events by type / project / status | counts from `events` (+ `event_projects` for the project filter, using effective status) |
| Event turnout | `present_count / eligible_count` from the snapshot (11.10). `null` if `eligible_count` is null or 0. Office bearers on `AUTO` rows are excluded from both. |
| Event gender | sum of `present_male`, `present_female`, `present_other` of finalised events in scope |
| Meeting turnout | `present_count / eligible_count` |
| Meeting gender | sum of the meeting gender snapshots |
| Attendance trend (monthly) | group finalised events/meetings by IST month |
| Service hours | `volunteer_year_hours` for the selected year (`event_hours`, `adjustment_hours`, `legacy_hours` shown apart) |
| Project hours | sum of `volunteer_year_hours` totals of volunteers currently in that project |

### 12.3 Gender ratio screens

Gender ratio matters to the team, so it is a first-class chart, not a footnote.

- **Overview (Coordinator/Tech):** a donut for the whole organisation (counts and shares), a stacked bar per project, a stacked bar per year (2nd, 3rd, 4th), and a small table per domain.
- **Events and meetings:** the present split per month (stacked columns) and per event on the event page ("Present: 61 · F 34 · M 26 · O 1").
- **PR:** the same for their own project only.
- **Volunteer list:** a gender filter, and a gender column for FULL viewers. CSV exports can include gender (Section 14.2).
- The system only **shows** the ratio. It does not enforce quotas. [DECISION D-17]

### 12.4 Data-quality panel (Coordinator/Tech)

| Issue | Meaning |
|---|---|
| `MISSING_PROJECT` | ACTIVE volunteer with no project, who holds no active Coordinator or Tech post |
| `PROJECT_PR_VACANCY` | a project has fewer than 2 PRs |
| `UNAPPROVED_HOURS` | COMPLETED, non-imported events with no approved hours |
| `UNLOCKED_PAST_EVENT` | a past event that should have been finalised but was not (the job did not run) |
| `ATTENDANCE_NOT_TAKEN` | needs-review events and meetings (11.7, 11.8) |
| `MISSING_MOM` | COMPLETED meeting without MOM |
| `MISSING_PHONE` | ACTIVE volunteer with no phone |
| `STALE_VOLUNTEER` | no attendance in 90 days. Information only. **Never changes anyone's status.** |
| `ROTATION_DUE` | an active post whose holder's year no longer fits the post (S-07) |
| `PASSED_OUT_NOT_ARCHIVED` | ACTIVE volunteers with computed year of 5 or more |
| `OLD_PENDING_REQUEST` | a Tech request waiting more than 7 days |
| `STUCK_DRAFT_EVENT` | a DRAFT event waiting more than 7 days for collaboration approval |

Each row links to a filtered page. The link never contains personal data.

---

## 13. Audit and accountability

### 13.1 What is audited

Every sensitive operation (full action list in Section 10.7). Each entry has: actor, highest role, action, entity type + id (+ label), the **target person** when one person's record is touched, project context, time, outcome, correlation id, reason (when required), a one-sentence `summary`, and a minimal `changes` JSON.

### 13.2 Rules

1. Written **in the same transaction** as the business change, through `runAudited(ctx, { action, entity, summary, reason, changes }, fn)`. If the audit insert fails, the business write rolls back.
2. Failed or denied sensitive attempts are logged with `outcome = FAILURE | DENIED` (outside the failed transaction, best effort).
3. Bulk actions write **one** row with a roll-number list in `changes`. A permanent delete is the exception: it stores only the count (11.13).
4. `changes` holds only changed fields, never credentials, tokens, phone, blood group, gender or note text (log "notes updated" instead). Max about 8 KB.
5. **Reasons are mandatory** for: attendance corrections, FCFS edits after the lock, red-flag revoke, role revoke/suspend, emergency grants, hours adjustments, cancellations, retention runs, feature-flag changes, soft-rule overrides, edit-budget grants, volunteer suspend/reinstate/archive/delete, and every request.
6. Visible to Coordinators and Tech (read-only), with filters (who, whom, action, project, date) and pagination of 50.
7. Retention: 30 days **and** at most 50,000 rows (`audit_retention_days` 7–365, `audit_max_rows`). Purged by `pg_cron`, not by the app (8.7).
8. The app database role cannot update or delete audit rows (8.7).
9. Exports of the audit log are not provided.
10. Every override of a soft rule is visible: `changes.override = { rule, reason }`. Writes made through an emergency pack carry `changes.emergencyGrantId`.

### 13.3 What is deliberately NOT logged [DECISION D-13]

- **CSV import and CSV export done by a Coordinator or a Tech member** are **not logged**. The reason is to keep the log short and to let the people running the system move data without noise. This is a hard rule 6 exception, and the only one besides page views.
- **CSV actions by anyone else are always logged** (today that means PR exports; `CSV_EXPORT` with the filters, the column names and the row count, never the data).
- Reading pages is not logged.
- A setting `audit_staff_csv` (default `false`) switches logging on for Coordinators and Tech without a deploy, if the team ever wants it.
- Risk, written down on purpose: about 15 accounts can download personal data without a trace. The limits in Section 17 (3 exports per hour, 10 per day, 2,000 rows) and the fact that only KIIT Google accounts with an active post can get in are the safeguards. Say this in `docs/AUDIT_POLICY.md`.
- Undoing an import batch **is** logged (`IMPORT_UNDO`), because it deletes data.

### 13.4 Denied logins without filling the table

Anyone on the internet can start a Google login, so `LOGIN_DENIED` must not be a way to flood the audit table.

- At most **one** `LOGIN_DENIED` row per identity per hour, and at most **200 per day** in total. More attempts are only counted in `rate_limits`.
- The row has `actor_roll` = the roll number only if the email's first part matches `ROLL_NUMBER_PATTERN`; otherwise `actor_roll` is null and `entity_label` holds the first 8 characters of a hash of the email, so repeats can be seen without storing the address. `actor_role` is null. The IP is stored.
- `RATE_LIMIT_TRIP` rows are deduplicated per person per hour (17.5).

---

## 14. CSV import and export

### 14.1 Shared rules

- Files: UTF-8, comma separated, header row required, max **1 MB**, rows as limited below. Excel files are not accepted (save as CSV).
- Every row is checked with the same Zod schemas as the forms (Section 3, rule 17).
- Import is always **two steps**: upload → **dry run** (a preview with valid / duplicate / error rows and the first 100 problems) → **Confirm**. The Confirm call carries the preview's short-lived token (15 minutes), so it can only apply exactly what was previewed.
- Imports run in one transaction with `set local statement_timeout = '30s'`.
- Row contents are **never logged** anywhere (not in audit, not in server logs).
- Templates (empty CSV with headers and one example row) can be downloaded from each import screen.
- Roll numbers are trimmed and checked against `ROLL_NUMBER_PATTERN`. A mismatch between the roll's first two digits and `batchYear` is only a **warning**.

### 14.2 Export

- Permission `export:csv:bounded`. Coordinator/Tech: all volunteers. PR: own project's volunteers. Event participant exports: for people who can see that event's participants.
- The user ticks columns from a **whitelist per role**, validated on the server. Volunteer columns: `rollNumber, name, email, gender, project, year, status, domains, phone, hostel, bloodGroup, cityState, batchYear, joinDate, eventsAttended, attendance rates, allocatedHours, redFlagsCount`. **Notes and red-flag reporter names are never exportable.**
- The query applies authorization and project scope in SQL, a hard `LIMIT` = `export_max_rows` (default 2,000), streamed from a Route Handler with `Cache-Control: private, no-store`.
- Format: **CSV with a UTF-8 BOM** so Excel opens it correctly. Any cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'` so a spreadsheet never runs it as a formula.
- Limits per person: 1 export at a time, 3 per hour, 10 per day (Section 17).
- Logging: PRs are logged (`CSV_EXPORT`). Coordinator/Tech are not (13.3).
- `flag.exports_enabled` switches exports off for everyone at once.

### 14.3 Import volunteers (`import:volunteers`, Coordinator and Tech)

Needed once for the first ~950 and then after every recruitment. Up to **1,000 rows** per file.

| Column | Rule |
|---|---|
| `rollNumber` | required, matches `ROLL_NUMBER_PATTERN` |
| `name` | required, 2–100 characters |
| `gender` | **required**: `MALE`, `FEMALE` or `OTHER` (also accepts M, F, Male, Female, Other in any case) |
| `batchYear` | required, e.g. 2025 |
| `project` | one of the 9 names; empty allowed (shown as a data-quality issue later) |
| `phone` | optional, 10 digits starting 6–9 |
| `hostel` | optional |
| `bloodGroup` | optional, one of the 8 values |
| `cityState` | **optional**, up to 60 characters |
| `status` | optional, `ACTIVE` (default) or `ARCHIVED` (for old volunteers who have left) |
| `joinDate` | optional, `YYYY-MM-DD`; default today |
| `domains` | optional, a `;` separated list of the four domains |

Rows that already exist (same `rollNumber`) are skipped and counted, never overwritten (`on conflict do nothing`). A row without gender is an **error**, not a warning. The result shows created / skipped / error counts, and the person can download the skipped and error rows as a CSV made in the browser (nothing is stored on the server). One `import_batches` row (kind and counts only) is written. **No audit row for Coordinator/Tech** (13.3).

Every year recruitment happens in August or September and about 315 new volunteers (all 2nd years) are randomly allotted to projects with their domains in mind. After that the 3rd years become seniors and get posts. A typical year has about 315 volunteers in each of the 2nd, 3rd and 4th years. This may change year to year.

### 14.4 Import old data (`import:history`, Coordinator and Tech)

Purpose: bring in old volunteers, old events, who attended them, and old hours, so every volunteer's hours are correct from the first day.

| Kind | Files | Result |
|---|---|---|
| Old volunteers | the file from 14.3 (set `status` to `ARCHIVED` for people who have left) | volunteer rows |
| Old events + attendance (`HISTORY_EVENTS`) | `events.csv` and `attendance.csv` together | completed events with approved hours and attendance; counters and hours updated |
| Old hours only (`HISTORY_HOURS`) | `hours.csv` | `legacy_hours` per person per academic year, for years where nobody kept per-event records |

**`events.csv`**: `event_key` (any text, unique inside the file), `title`, `type` (`CENTRAL` or `PROJECT`), `date` (`YYYY-MM-DD`, IST), `venue` (optional), `category` (name from the categories list, optional), `group` (title, optional, central only), `hours` (optional; the category default is used if empty; one of the two is required), `projects` (a `;` list of project names; required for `PROJECT` events), `counts_for_group` (optional `TRUE`/`FALSE`).

**`attendance.csv`**: `event_key`, `rollNumber`, `status` (`PRESENT` default, or `ABSENT`, `EXCUSED`), `source` (`AUTO` default, or `FCFS`, `WALK_IN`). Old lists usually have only the people who came, so the default `AUTO` keeps them out of the FCFS attendance rate. Use `FCFS` only if the file really lists everyone who had registered.

**`hours.csv`**: `rollNumber`, `academicYear` (the year the academic year starts, e.g. 2024 for July 2024 to June 2025), `hours`. The value **replaces** that person's `legacy_hours` for that year (it is not added).

Rules:

1. Limits per batch: **200 events** and **5,000 attendance rows**. Bigger histories go in several batches.
2. The dry run lists: unknown roll numbers (the person does not exist yet; import the volunteers first, or tick "skip unknown people"), unknown projects or categories (errors), possible duplicate events (same title and date as an existing event; skipped), and, for groups that do not exist yet, a small table to fill `full_hours` and `min_events_for_full` (leave empty for a group with no special rule).
3. For hours-only rows, the preview warns when that person already has event hours for that year ("this may count twice"). It is a warning, not a block.
4. Commit, in one transaction: insert the `import_batches` row, then the events (`is_imported = true`, `status = 'COMPLETED'`, `finalized_at = now()`, locked, `hours` set and `hours_approved_at = now()`, `hours_approved_by = 'SYSTEM'`, `created_by = 'SYSTEM'`, `created_by_role = null`, `academic_year` from the date, `attendance_lock_at` = start of the next IST day), `event_projects` (hosts for project events), then participants (`added_by`/`marked_by` = `SYSTEM`). Then `applyHistoryImport(batchId)` applies the counters (same statement as finalise, step 2 in 11.10), writes the snapshots (with `eligible_count` null), and runs the hours recompute for each affected academic year.
5. Imported events never move `projects.last_activity_at`, never appear in `UNAPPROVED_HOURS` or `UNLOCKED_PAST_EVENT`, and are marked "Imported" in lists.
6. **Undo** within 14 days (`import:history`): deletes the batch's events (their participants and project rows cascade), then repairs counters for the affected volunteers (`rebuildCounters` in Fix mode) and recomputes the affected years. It is refused if any event of the batch has an attendance correction. The undo is audited (`IMPORT_UNDO`). `HISTORY_HOURS` has no undo: import the file again with the right numbers.
7. Suggested order: volunteers → events and attendance, one year per batch → hours-only totals → check the Hours page and a few volunteer profiles.
8. The import itself is **not logged** for Coordinator/Tech (13.3).

---

## 15. Scheduled jobs (all free)

| Job | Where | When | What |
|---|---|---|---|
| Daily maintenance | GitHub Actions `schedule` (main) + Vercel Cron (backup) → `POST /api/cron/daily` with `Authorization: Bearer $CRON_SECRET` | 00:10 IST every day. Cron expressions are in **UTC**: `40 18 * * *` | The steps below |
| Audit purge | `pg_cron` inside Supabase | 02:00 IST (`30 20 * * *` UTC) | `select purge_audit_log()` |
| Backup | GitHub Actions | weekly, Sunday | `pg_dump -Fc` through the **session-mode** pooler → encrypt with `age` (public key in the repo, private key kept offline by the Tech lead) → keep as a private artifact (last 4 weekly + 1 monthly copy) and/or copy to the team's Drive |

**Daily maintenance steps** (in this order; the route is idempotent and safe to run twice):

1. Finalise every event and meeting whose lock time has passed and `finalized_at IS NULL`, **unless it needs review** (11.7, 11.8).
2. Auto-complete meetings still `ONGOING` after their lock, then finalise them.
3. Expire old requests (`PENDING` older than `request_expire_days` → `EXPIRED`). Delete decided requests older than 90 days.
4. Delete `rate_limits` and `idempotency_keys` rows older than 1 day.
5. **Keep-alive.** The steps above are real database queries, so Supabase sees activity. The route also runs a plain `select 1` if nothing else ran.
6. Measure the database size (`pg_database_size`). Save it in `settings` as `system.db_size_bytes` (and `system.last_daily_run`) for the Settings page.
7. At **350 MB** mark a warning on Settings. At **425 MB** set `flag.read_only = true` and make the workflow step **fail on purpose** so GitHub e-mails the Tech team.
8. Write one `CRON_RUN` audit row with counts.

Notes:

- Tech Mentors and Coordinators can press **Run now** (`run:maintenance`). It is limited to once per 5 minutes.
- Locking is also done **lazily**: any read or write checks `now() >= attendance_lock_at`, and opening a past, locked, unfinalised event or meeting triggers `finalizeX` for it (guarded by an advisory lock). So correctness never depends on the cron. Only the freshness of counters does.
- GitHub can disable scheduled workflows in a repository with no activity for 60 days (documented for public repositories; check how it applies to ours). The Vercel Cron backup and the yearly handover checklist cover this.
- Vercel Hobby cron runs at most once a day and the time is not exact. That is enough for a backup trigger.
- A GitHub Actions run can start late. Nothing in the app assumes the job ran at exactly 00:10.

---

## 16. Architecture, security, caching and concurrency

### 16.1 Code layout (modular monolith)

```
src/
  app/                  # routes (RSC by default). (auth)/login, denied, (app)/overview, volunteers, projects,
                        # events, meetings, hours, analytics, audit, team, requests, emergency, settings,
                        # api/cron/daily, api/export/*
  config/               # identity.ts, app.ts, limits.ts  (Appendix C)
  features/<feature>/   # volunteers, projects, events, meetings, attendance, hours, imports, requests,
                        # analytics, audit, access, settings
    service.ts          #   business rules; takes ActorContext first
    repo.ts             #   Drizzle queries; SQL-level scope; explicit column lists
    schemas.ts          #   Zod (bounds identical to DB CHECKs)
    counters.ts         #   only where counters change (11.10)
    components/         #   feature UI
  db/schema/*.ts        # Drizzle schema = Section 8
  lib/
    auth/               # Supabase sign-in, getActor() -> ActorContext (React.cache per request)
    authz/              # can(), tier.ts, soft-rules.ts, emergency.ts, scope helpers
    audit/              # runAudited()
    limits/             # rate-limit.ts, idempotency.ts, size caps (Section 17)
    cache/              # shared aggregate cache wrappers and the key registry (16.4)
    platform/           # everything hosting-specific: cron routes, env names, headers (plan B in 2.5)
    time.ts             # IST helpers (11.1)
    errors.ts           # ActionResult / ErrorCode
  types/                # Section 10
scripts/                # seed.ts, synthetic-data.ts, restore-office-access.sql
seed/                   # staff.template.csv (committed); seed/local/ is git-ignored and holds the filled file
drizzle/                # generated migrations + manual/*.sql (security, functions, cron)
docs/                   # Section 22
```

Dependency direction: `app` → `features/*/service` → `features/*/repo` → `db`. UI never imports `repo` or `db`. Client Components receive plain DTOs only.

### 16.2 Authentication flow

1. Login page → Supabase Google sign-in (`hd=kiit.ac.in` hint, but the **server** re-checks everything).
2. `/auth/callback` exchanges the code and sets secure `HttpOnly` cookies via `@supabase/ssr`.
3. Every request: verify the session on the server by checking the JWT locally (Section 2.4), then run the access gate (4.4). No role or project is ever read from the JWT or cookies.
4. Middleware only does a cheap "has a session cookie" redirect for UX. **Real authorization is inside every Server Action, Route Handler and data function.**
5. Sign-out: end the Supabase session, do a hard navigation to `/login` and send `Clear-Site-Data: "cache"` where browsers support it (so the back button cannot show private pages).

### 16.3 Security checklist

- Deny by default; `ActorContext` per request; scope in SQL; `NOT_FOUND` for out-of-scope.
- Postgres roles, RLS, timeouts exactly as in 8.7. The Data API is unused and locked.
- Server Actions for mutations (built-in origin checks) + Zod + strict length limits. Route Handlers (exports, cron) check session or secret and `Origin`.
- Parameterised queries only (Drizzle). No string-built SQL.
- Cookies `Secure`, `HttpOnly`, `SameSite=Lax`.
- Headers on every response: a tested Content-Security-Policy (no inline scripts except the framework's nonce'd ones), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'`, `Permissions-Policy` that turns off camera, microphone and geolocation. React output escaping; no `dangerouslySetInnerHTML`.
- CSV export formula guard (14.2). CSV import validated by Zod, never trusted.
- Rate limiting, idempotency, size caps and quotas: Section 17. They are part of security, not an extra.
- Secrets only in Vercel/GitHub secret stores: `DATABASE_URL` (pooler, `app_user`), `ADMIN_DATABASE_URL` (migrations, CI only), `SUPABASE_URL`, `SUPABASE_ANON_KEY` (sign-in only), `CRON_SECRET`, backup key. **No service-role key in the app at all.** Separate production and staging projects and credentials.
- Maintenance mode flag makes every mutation return `MAINTENANCE` except for Coordinator and Tech. Read-only mode returns `READ_ONLY` the same way.
- Logs: structured JSON with `correlationId`. Roll numbers are allowed. **No phone, blood group, gender per person, notes, tokens, CSV rows.**
- Privacy: the data is personal data of students. Review the institute's policy and India's Digital Personal Data Protection Act, 2023 with the institution before launch (who is the data owner, how long data is kept, how a person can ask for deletion). The delete flow in 11.13 and the retention rules in 11.14 are the technical part of that answer.

### 16.4 Caching (what is cached, where, for how long)

Privacy beats hit rate, and the Vercel Hobby quotas (Section 9.3) make caching worth doing. The idea is simple: **cache shared, non-personal numbers on the server for a short time, cache the user's own recent pages in their own browser for a few seconds, and never cache anything personal in a place another person can reach.**

| Tier | What | Where | Lifetime | Personal data? |
|---|---|---|---|---|
| C0 | JS, CSS, fonts, icons | CDN and browser, hashed file names, `immutable` | 1 year | no |
| C1 | Static pages: login, access denied, outage help, error pages | prerendered at build, served from the CDN | until the next deploy | no |
| C2 | **Shared aggregate cache**: counts and public reference data | the framework's server data cache, by key (registry below) | 60 s to 1 h per key | **no**: counts, ids and public names only |
| C3 | Per-request dedupe (`React.cache`): `getActor()` and repeated lookups | inside one request | one request | yes, but it never outlives the request |
| C4 | Client router cache of pages the person visited | the person's own browser memory | **30 s** for dynamic pages | yes (their own pages); cleared on sign-out |
| C5 | Private pages and API responses | `Cache-Control: private, no-store` (the framework default for dynamic pages; do not override) | none | yes, never stored |

**C2 key registry.** Nothing else may be put in the shared cache without adding a row here.

| Key | Content | Who may read it (checked **before** the cached call) | TTL | Invalidate |
|---|---|---|---|---|
| `ref:projects` | the 9 project cards (name, SDGs, tagline, accent colour) | any office user | 1 h | tag `ref` when a project is edited |
| `ref:categories` | event categories and default hours | any office user | 1 h | tag `ref` |
| `ref:adjustment_types` | hours tags | Coordinator, Tech | 1 h | tag `ref` |
| `ref:settings` | non-secret settings | server only | 60 s | tag `settings` when changed |
| `events:upcoming` | cards of scheduled, published and ongoing events (title, time, venue, type, projects, slot counts) | any office user | 60 s | tag `events` on publish, cancel, reschedule |
| `analytics:org:{year}` | organisation dashboard (counts, gender ratio, trends) | Coordinator, Tech | 300 s | none (TTL), plus after an hours recompute or a history import |
| `analytics:project:{projectId}:{year}` | one project's dashboard | Coordinator, Tech, PR of that project | 300 s | none (TTL) |
| `dq:org` | data-quality counts | Coordinator, Tech | 300 s | none (TTL) |
| `meta:db_size` | last measured database size | Coordinator, Tech | 1 h | none |

Rules:

1. A cached function takes **plain ids and years only** (never `ActorContext`) and returns **no personal data**. The authorization check runs first, in the page or action, and only then is the cached function called. A key never contains a roll number.
2. **TTL first.** Routine writes (attendance, FCFS entry, notes) do **not** invalidate anything. Under edit spam, invalidation would force a recompute every time and defeat the cache. Tag invalidation is allowed only for: publish/cancel/reschedule, project edits, settings changes, hours recompute, history import commit, retention run. Even then a tag is invalidated at most once per 15 seconds (use a `rate_limits` bucket `inv:<tag>`); the TTL catches up the rest.
3. Prefer **stale-while-revalidate**: when a value has expired, serve the old value and refresh in the background, so no visitor waits for a recompute.
4. Use whichever caching API the pinned Next.js version documents as stable (`use cache` with `cacheLife` and `cacheTag`, or `unstable_cache`). The rules above are what matter, not the function name.
5. **Never cached:** `ActorContext`, permission decisions, any volunteer FULL data, notes, anything keyed by a person, exports, audit pages, anything behind an emergency grant.
6. **Client router cache (C4):** set the framework's stale time for dynamic pages to 30 seconds (in Next.js this is `experimental.staleTimes.dynamic`; use the name in the pinned version). Effects: going back, or reopening a page you just visited, does not call the server again. Every Server Action ends with `revalidatePath` for the pages it changed, which clears the client cache for them. **Live screens** (attendance sheet, FCFS entry, request inbox) call `router.refresh()` when they open and after each save, so they never show data older than the person's own last save. List pages show "Updated 20 s ago" with a Refresh button (the Refresh button is limited like any read, Section 17).
7. Prefetching: table and list row links use `prefetch={false}`. A prefetch of a private dynamic page costs a real invocation.
8. If the pinned Next.js has stable **Partial Prerendering / Cache Components**, the page shell (sidebar, header, skeletons) may be static and the personal parts streamed. This is optional and must not change rules 1 to 7.

Tests (Section 20): user B never receives user A's data; the back button after sign-out shows no private page; private routes send `no-store`; a cached function cannot be imported by client code.

### 16.5 Concurrency

- Lock the parent row with `SELECT ... FOR UPDATE` for: FCFS entry (the `event_projects` row), event status changes, finalise, collaboration approval, request approval.
- `lock_timeout` is 3 seconds. On timeout the action returns `CONFLICT` with "Someone else is saving this. Try again in a moment." Nothing waits for ever.
- Use `insert ... on conflict` for attendance marking and FCFS entry.
- `finalized_at IS NULL` inside the transaction, plus an advisory lock, makes finalise exactly-once. The hours recompute and the retention run take their own advisory locks and refuse to start twice.
- Two PRs of the same project entering names at the same time are serialised by the slot-row lock, so slot limits cannot be exceeded.
- Forms carry `expectedEditCount` (11.2) so a person never overwrites someone else's newer save without noticing.

### 16.6 Performance rules

Backend

- Few, indexed, set-based queries per page, run with `Promise.all` (Section 9.5). No query inside a loop.
- Every list is paginated on the server (max 50). Every query has a `LIMIT`.
- Server Actions return small DTOs. `revalidatePath` is targeted, never the whole app.
- Timeouts from 8.7 stop a slow query from piling up.

Frontend

- Server Components by default. `"use client"` only for interactive leaves.
- Streaming with `loading.tsx` skeletons. Pages show the frame first and fill in.
- Bundle budgets, checked in CI with the bundle analyzer: **initial JavaScript ≤ 170 KB gzipped per route**. Recharts, TanStack Table (only on table routes), the command palette and heavy dialogs are loaded on demand. Use the package's `optimizePackageImports` for Lucide. Motion is loaded with `LazyMotion` and the small feature set.
- No Next.js image optimisation (Hobby has a small transformation quota). Icons are inline SVG. If a picture is ever needed, serve it pre-sized from `public/`.
- One font family through `next/font` (self-hosted), 2 weights, `display: swap`.
- Search boxes debounce by 300 ms, need 2 characters, and cancel the previous request.
- Targets on a mid-range phone over 4G: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

---

## 17. Abuse protection and limits (staying up when people mash buttons)

The goal: one person refreshing ten times, saving the same thing twenty times, or running a script must **never** slow the system for everyone else or use up the free quotas. Most of the time this will be an honest mistake (a double-click, a stuck page, a long weekend of F5), so the limits are generous for normal use and gentle when they trip. They are also the main defence against the Vercel quota pause (Section 2.1).

### 17.1 Principles

1. **Count the attempt, not the success.** A person who sends 500 invalid requests must be counted even though every one fails. So the counter is bumped **before** the business transaction, never inside it (a rolled-back transaction would also roll back the count).
2. **Reject early and cheaply.** Unauthenticated requests cost no database call. Rate-limited requests are refused before any page is rendered.
3. **Every mischief has its own defence** (17.10). Refresh = reads. Double-click = duplicate writes. Repeat save = no-ops. Bulk spam = big transactions. Login hammering = audit flooding.
4. **One file for numbers.** All limits live in `src/config/limits.ts` and can be overridden from Settings (`settings.limits`) by `manage:settings:system`.
5. **Coordinators and Tech get 3× the read, write and bulk limits and no cooldown**, so they can never be locked out in the middle of an incident. They still have the hard caps (sizes, exports, imports).
6. **Fail safe.** If the limiter itself fails (database error), reads continue (the site does not go down because of its own guard) and exports, imports and bulk writes are refused.
7. **Say what happened, in plain words,** and when to try again (17.4).

### 17.2 The layers, in the order a request meets them

| # | Layer | What it does | Cost of a rejected request |
|---|---|---|---|
| 1 | **Vercel firewall** (the free plan allows 1 rate-limit rule and 3 custom rules) | Rule 1: rate limit **600 requests per minute per IP** on dynamic paths (not on `/_next/static`). Many students share one campus IP, so the number is high on purpose. Rule 2: deny `/api/cron/*` and `/api/export/*` when the request has no `Authorization` header or session cookie. Rule 3: kept empty for emergency blocks. **Attack Challenge Mode** is the panic button. | Blocked at the edge. Not an invocation. |
| 2 | **Auth first** | The JWT is verified locally (2.4). No session → redirect or 401 with **no database call**. | Tiny CPU |
| 3 | **Per-person limiter in Postgres** (17.3, 17.4) | Read, write, bulk, export, import, create, heavy buckets. | One small query (reads: none extra, see 17.3) |
| 4 | **Idempotency and no-op detection** (17.6) | Double-submits and repeated identical saves do nothing. | Cheap |
| 5 | **Size caps and timeouts** (17.8) | Bounded lists, bodies, rows. Statement, lock and idle timeouts. | n/a |
| 6 | **Cache and prefetch discipline** (16.4) | Shared aggregates, client router cache, no prefetch. | n/a |
| 7 | **Breakers** (17.7) | Read-only mode when the database nears its size limit, strict mode when a quota runs high, maintenance mode. | n/a |

### 17.3 The limiter (shared by every serverless instance)

An in-memory counter does not work on serverless: each instance has its own memory and it resets on a cold start. So the counters live in the small `rate_limits` table (Section 8.6).

```sql
-- One upsert per bump. window_start is the start of the current window.
-- minute windows:  date_bin('1 minute', now(), timestamptz 'epoch')
-- hour windows:    date_bin('1 hour',   now(), timestamptz 'epoch')
-- day windows are aligned to IST midnight: date_bin('1 day', now(), timestamptz '1970-01-01 18:30:00+00')
insert into rate_limits (bucket, window_start)
values ($1, $2)
on conflict (bucket, window_start) do update set hits = rate_limits.hits + 1
returning hits;
-- if hits > limit  ->  RATE_LIMITED, retryAfterSec = seconds until the window ends
```

```ts
// src/lib/limits/rate-limit.ts
export async function hit(bucket: BucketName, who: string, window: "minute" | "hour" | "day"):
  Promise<{ hits: number; limit: number; retryAfterSec: number }>
```

Bucket names: `r:<roll>` reads, `w:<roll>` writes, `b:<roll>` bulk, `x:<roll>` exports, `i:<roll>` imports, `c:<roll>` creates, `h:global` heavy jobs, `ld:<ip>` denied logins, `inv:<tag>` cache invalidation, `trip:<roll>` limit trips, `cool:<roll>` cooldown.

**Reads cost no extra query.** `getActor()` already runs one SQL per request (Section 9.5). The same statement bumps the read bucket and checks the cooldown:

```sql
with bump as (
  insert into rate_limits (bucket, window_start)
  values ('r:' || $roll, date_bin('1 minute', now(), timestamptz 'epoch'))
  on conflict (bucket, window_start) do update set hits = rate_limits.hits + 1
  returning hits
)
select  /* ... the normal actor columns ... */
        (select hits from bump) as read_hits,
        exists (select 1 from rate_limits where bucket = 'cool:' || $roll and window_start > now()) as cooling
from volunteers v where v.roll_number = $roll;
```

**Writes and bulk actions** bump `w:` (and `b:` when bulk) in a separate statement **before** the business transaction. Imports and exports bump `i:`/`x:`.

### 17.4 Default limits (`src/config/limits.ts`)

| What | Default, per person | Coordinator / Tech |
|---|---|---|
| Page loads and data fetches (`r:`) | **120 per minute** | ×3 |
| Any save or action (`w:`) | **30 per minute** and **1,000 per day** | ×3 |
| Bulk actions: attendance marking, FCFS submit, bulk hours adjustment (`b:`) | **10 per minute** | ×3 |
| CSV export (`x:`) | **1 at a time, 3 per hour, 10 per day**, max 2,000 rows | same |
| CSV import (`i:`) | **3 per day**, max 1,000 rows (old events: 200 events and 5,000 attendance rows), 1 MB | same |
| Creating events and meetings (`c:`) | **20 per day**, and at most **10 open drafts** per person | exempt from the draft cap |
| Heavy jobs: hours recompute, rebuild counters, daily job "Run now", retention (`h:global`) | **1 per 5 minutes, for everyone together**, one at a time (advisory lock) | same |
| Denied logins (`ld:<ip>`) | 20 per 10 minutes per IP | n/a |
| Audit rows per person | max **1,000 per day** | ×3 |
| Roll numbers per call | attendance **500**, FCFS **100**, bulk hours **100** | same |
| Pending requests per Tech member | max **10** (each up to 200 volunteers; delete up to 50) | n/a |
| Emergency grants | max 3 active per grantee, 10 per grantor, 24 h each | same |
| Tagged hours per volunteer | max 50 per academic year | same |
| Table page size | **50** | same |
| Request body (Server Actions) | 1 MB | same |
| Edit budget | 2 saved changes after the first save (11.2) | exempt |

What the person sees when a limit trips: **"You're going a bit fast. Try again in {n} seconds."** (HTTP 429 with `Retry-After` for route handlers; `RATE_LIMITED` with `retryAfterSec` for actions.) The button stays disabled until the time is up. The message never blames: most trips are a stuck page or a double-click.

### 17.5 Repeated trips and the cooldown

- When a person hits a limit, bump `trip:<roll>` (10-minute window).
- At **3 trips in 10 minutes**: write a cooldown row (`cool:<roll>`, `window_start` = now + 5 minutes) and write **one** `RATE_LIMIT_TRIP` audit row (at most one per person per hour). During the cooldown reads and writes return `RATE_LIMITED` with the time left.
- Coordinators and Tech members are never put in a cooldown. Their trips are only counted.
- A Coordinator or Tech member can clear someone's cooldown from the Team page.

### 17.6 Double-submits, retries and repeated saves

**Idempotency key.** Every form generates `crypto.randomUUID()` when it opens and sends it with the action. `runAudited()` runs this as the **first** statement of its transaction:

```sql
insert into idempotency_keys (key, actor_roll) values ($1, $2)
on conflict (key) do nothing returning key;
-- no row returned: this exact submit already happened  ->  return { ok: true, notice: "Already saved." }
```

It is in the same transaction as the write. If the write fails, the key is rolled back too, so a retry works. Keys are deleted after a day.

**No-op detection.** An update that changes nothing writes nothing: no audit row, no counter change, no `revalidatePath`.

```sql
update volunteers set name = $2, city_state = $3, updated_at = now()
 where roll_number = $1 and (name, city_state) is distinct from ($2, $3)
returning roll_number;
-- 0 rows: nothing changed -> return ok, skip audit and revalidate
```

**UI side.** Submit buttons turn into a spinner and are disabled while the action runs (`useTransition` / `useFormStatus`). Rapid repeated clicks cannot send two requests. Refresh after a save is just a page load (a read), never a re-submit.

**Naturally idempotent writes:** attendance upsert, FCFS `on conflict do nothing`, finalise (`finalized_at IS NULL` + advisory lock), approvals, imports (`import_batches` + the preview token).

### 17.7 Breakers: automatic and manual

| Trigger | What happens | Who can undo it |
|---|---|---|
| Database ≥ 425 MB | `flag.read_only = true`: only Coordinator/Tech can write; others get `READ_ONLY` | Coordinator/Tech after running the retention tool |
| A Vercel quota above 60% in the first half of the month (a person checks the Usage page weekly) | `settings.limits_mode = 'strict'`: read limit 60/min, write limit 15/min, exports 1/hour, shared-cache TTLs doubled | `manage:settings:system` |
| `audit_log` reaches 50,000 rows | the purge deletes the oldest rows beyond the cap (8.7) | automatic |
| `flag.maintenance_mode` | every mutation returns `MAINTENANCE` except for Coordinator/Tech | `manage:feature_flags` |
| `flag.fcfs_entry_enabled = false` | FCFS entry is off for PRs (use during an incident or while fixing a bad list) | `manage:feature_flags` |
| `flag.exports_enabled = false` | exports are off for everyone | `manage:feature_flags` |
| A suspicious pattern | **Attack Challenge Mode** in the Vercel dashboard | the Tech lead |

### 17.8 Database guards

- Role-level timeouts (8.7): statement 8 s, lock 3 s, idle-in-transaction 10 s. Imports and the hours recompute raise the statement timeout for their own transaction only (`set local statement_timeout = '30s'`).
- Heavy jobs take an advisory lock and refuse to start twice (`pg_try_advisory_xact_lock`). The second caller gets "Already running, try again in a minute."
- Lazy finalise is guarded the same way, so 50 people opening one unfinalised event cause one finalise.
- Pooler only, `max: 1` per instance, `prepare: false` (rule 13).
- Every list has a `LIMIT`. Every bulk input has a cap (17.4). A request that exceeds a cap is rejected with `VALIDATION` before any database work.

### 17.9 Audit and storage cannot be flooded

- Per-person audit cap: 1,000 rows per day (17.4).
- Denied logins: 1 audit row per identity per hour, 200 per day overall (13.4).
- Limit trips: 1 audit row per person per hour (17.5).
- The table is capped at 50,000 rows and 30 days (8.7).
- Row-count caps on the real data (50 tagged-hours rows per volunteer per year, 100 names per FCFS submission, 10 open drafts per person, 20 creates per day) keep one person from filling the 500 MB database.

### 17.10 What each kind of mischief runs into

| Behaviour | What it would cost | What stops it |
|---|---|---|
| Hammering refresh | Invocations, CPU, one DB query per load | Edge rule (layer 1), read limit and cooldown (17.4, 17.5), cheap pages, 30 s client cache, shared aggregate cache |
| Double-click or retry on a save | Duplicate rows | Idempotency key, disabled button |
| Saving the same edit again and again | Writes, audit rows | No-op detection, edit budget (11.2) |
| Editing a record many times | Messy data | Edit budget: 2 changes, then ask a Coordinator or Tech member |
| Marking attendance in a loop | Locks, big transactions | Bulk limit 10/min, 500 rolls per call, no-op rows skipped, row locks with a 3 s timeout |
| Two PRs saving the same list together | Slot overrun | Row lock on the slot row, expected edit count |
| Opening the same unfinalised event in many tabs | Repeated finalise | Advisory lock, `finalized_at IS NULL` |
| Exporting again and again | CPU, data leaving | 1 at a time, 3/hour, 10/day, 2,000 rows |
| Creating hundreds of events or meetings | Table growth, noise | 20 per day, 10 open drafts |
| Starting Google logins with random accounts | Audit flooding, CPU | Auth-first, capped `LOGIN_DENIED`, edge rule per IP |
| A script calling the cron or export routes | CPU, data | Secret or session check, edge rule 2, rate limits |
| Mass "Run now" or recompute | Long locks | One heavy job per 5 minutes for everyone, advisory lock |
| A deliberate flood from many accounts | Quota pause | Strict mode, maintenance flag, Attack Challenge Mode, weekly Usage check |

---

## 18. Frontend and UI specification

### 18.1 Principles

- Calm, minimal, and a little premium. Lots of white space, one accent colour, restrained glass effects, smooth but light motion.
- It must be quick to use on a phone at an event gate, and dense and efficient on a desktop in the office. These are two designed layouts, not one squeezed layout.
- A person should always know three things: where they are, what they can do here, and what happened after they pressed a button.
- The UI hides what a person cannot use. The server is still the real gate (rule 22).
- Light and dark follow the system setting. Reduced motion is respected.
- English only. Indian formats everywhere (`en-IN`): `18 Oct 2026`, `6:30 pm`, `₹` is not needed.

### 18.2 Design tokens (starter set; the final values live in `docs/UI_SPEC.md` and `src/app/globals.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f8fa` | `#0b0d12` | page background |
| `--surface` | `#ffffff` | `#12151c` | cards, tables |
| `--surface-glass` | `rgba(255,255,255,.72)` | `rgba(18,21,28,.64)` | top bar, bottom nav, sheets (with `backdrop-filter: blur(12px)`) |
| `--border` | `#e5e7ee` | `#232834` | lines |
| `--text` | `#0f172a` | `#e8ebf2` | main text |
| `--muted` | `#5b6475` | `#98a1b3` | secondary text (contrast must stay at least 4.5:1) |
| `--primary` | `#2457d6` | `#6b93f5` | buttons, links, focus |
| `--danger` / `--warn` / `--ok` | `#c62828` / `#b26a00` / `#1b7f4b` | lighter equivalents | status |
| `--project-accent` | from `projects.accent_color` | same | only on project chips and the project header |

- Type: one family (Inter through `next/font`), two weights (400 and 600). Scale: 12, 14 (body), 16, 20, 24, 32. Numbers in tables use tabular figures.
- Space: 4-pixel base (4, 8, 12, 16, 24, 32, 48). Radius: 8 for controls, 12 for cards, 16 for sheets. One soft shadow level.
- **Glass** is used only on the top bar, bottom navigation and sheets, never on tables or forms. Fall back to a solid surface when `backdrop-filter` is not supported or in dark mode on low-power devices. At most 2 blurred layers on screen.
- **Motion:** 150–220 ms, ease-out, opacity/transform only. Page changes: a quick fade. Lists: no staggered animation for more than 10 rows. With `prefers-reduced-motion`, no movement at all, just fades.
- **Charts:** colour-blind-safe palette. The gender chart uses three clearly different hues **plus labels and counts**, never colour alone.

### 18.3 Layouts

| Screen | Layout |
|---|---|
| Phone (< 768 px) | Top bar with page title and a menu. **Bottom navigation with at most 5 items** and a "More" sheet. Tables turn into cards. Dialogs open as bottom sheets. Sticky action bar for the main button. Touch targets at least 44 × 44 px. Respect safe-area insets. |
| Tablet (768–1023 px) | Collapsible icon rail on the left. Two-column cards. Tables with fewer columns. |
| Desktop (≥ 1024 px) | Fixed 240 px sidebar, dense tables with sticky header, command palette on **Ctrl/⌘ + K** (jump to a volunteer by name or roll, an event, a page), keyboard shortcuts for common actions (`g e` events, `g v` volunteers, `/` search). |

### 18.4 Navigation (each item shows only if the role can use it; the server still checks)

| Item | COORD | TECH | PR | POC / BLD | Emergency-only person |
|---|---|---|---|---|---|
| Overview | ✅ org | ✅ org | ✅ own project | ✅ (upcoming events only) | ❌ |
| Volunteers | ✅ all | ✅ all | ✅ own project | ❌ | ❌ |
| Projects | ✅ all | ✅ all | ✅ own (others: public info only) | ✅ public info only | ❌ |
| Events | ✅ | ✅ | ✅ | ✅ upcoming/ongoing + own created | ❌ |
| Meetings | ✅ | ✅ | ✅ | ✅ (central/builders) | ❌ |
| Attendance | ✅ | ✅ | ✅ | ✅ POC (central), others own | ❌ |
| Hours | ✅ | ✅ | ❌ | ❌ | ❌ |
| Analytics | ✅ org | ✅ org | ✅ own project | ❌ | ❌ |
| Requests | ✅ inbox with badge | ✅ "My requests" | ❌ | ❌ | ❌ |
| Audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Team and access | ✅ | ✅ | ❌ | ❌ | ❌ |
| Imports and exports | ✅ | ✅ | ✅ export only | ❌ | ❌ |
| Settings | ✅ | ✅ (limited by kind) | ❌ | ❌ | ❌ |
| **Emergency tasks** | ✅ (to grant) | ✅ (to grant) | ❌ | ❌ | ✅ the only item |

### 18.5 Page inventory

| Route | Who | What is on it | Queries |
|---|---|---|---|
| `/login`, `/denied` | everyone | Google button; plain denied message. Static pages. | 0 |
| `/overview` | office users | Role-specific cards: upcoming events, my tasks, org/project numbers, data-quality shortcuts, gender donut | 0–3 |
| `/volunteers` | C, T, PR | Search, filters (project, domain, status, year, **gender**), sortable table, 50 per page | 2 |
| `/volunteers/[roll]` | C, T, PR | Profile, stats, hours by year, history tabs, red flags, notes (edit budget), actions by role | 3 |
| `/volunteers/new`, `/volunteers/import` | C, T | Create form; CSV import wizard (14.3) | n/a |
| `/projects`, `/projects/[slug]` | office users | Cards; project page with PRs, SDGs, activity, events | 1–2 |
| `/events` | office users | Tabs: upcoming, ongoing, past (by permission); filters | 2 |
| `/events/new` | creators | Event wizard (18.6) | n/a |
| `/events/[id]` | by permission | Details, projects and slots, FCFS entry tab, attendance tab, hours, history | 3 |
| `/meetings`, `/meetings/new`, `/meetings/[id]` | by permission | Lists; create; start/end, attendance, MOM | 2–3 |
| `/hours` | C, T | Approval table, adjustments (tags), recompute, imports of old hours | 2 |
| `/analytics` | C, T, PR | Charts, gender ratio, trends, project comparison | 0–2 (cached) |
| `/requests` | C (inbox), T (mine) | Request cards with Approve / Reject; Tech creation form | 1–2 |
| `/audit` | C, T | Filterable, paginated audit list | 2 |
| `/team` | C, T | Roster, grant/end posts, emergency grants, clear cooldown | 2 |
| `/emergency` | grantee | Active grants and the one-screen tools for each | 1–2 |
| `/settings` | C, T | Business settings, system settings (by kind), flags, limits, DB size gauge | 1 |

### 18.6 Key screens and flows

- **Review → Confirm component** (`<ConfirmEdit>`). Used by every PR/POC/Builder save in 11.2. Step 1 form, step 2 "Review": a before/after list plus the notice text, with **Back** and **Confirm and save**. After save, a toast says how many edits are left. When 0 are left, the edit button says "Ask a Coordinator or Tech member".
- **Event wizard** in four steps: Details → Projects and slots (with per-year caps and collaboration) → FCFS window (defaults filled from settings) → Review. Drafts are saved on the first "Next", with an idempotency key.
- **FCFS entry sheet.** Shows slots left for the project and per year, a paste box for roll numbers, a preview of who will be added and who will be skipped (and why), then Review → Confirm. Shows "Window closes in 23 min".
- **Attendance sheet.** Search, bulk select, big tick buttons, a progress bar ("48 of 62 marked"), a filter by project and by status, a Print button. Status chips: Present, Absent, Excused. Auto-save per bulk action. On a phone, one card per person with three large buttons.
- **Correction dialog.** Old status → new status, reason required (at least 10 characters), shows what was there before.
- **Hours approval table.** Events as rows with category default prefilled, one "Approve selected" action, then a clear **Recompute** button with last-computed time.
- **Tagged hours.** Pick people (up to 100), pick a tag, date, hours (prefilled), description. Rows that would be duplicates are shown as "already added".
- **Access grant flow.** Roll number → profile preview → "What post?" → checks (soft warnings are yellow and can be overridden by a Coordinator with a reason).
- **Requests inbox (Coordinator).** One card per request: kind, who asked, why, and a short list of volunteers (names, roll, project, year, with "show all"). Buttons **Approve** and **Reject**; **Approve all on this page**. For a delete request a field asks to type `DELETE 12` once. A badge in the navigation shows the pending count.
- **Tech request form.** On a volunteer's page or a bulk list: "Ask a Coordinator to suspend / archive / delete". A reason is required. Shows the request status afterwards.
- **Emergency grant dialog.** Pick a person, pick a pack, pick the one project/event/meeting, a reason, a duration (max 24 h). The summary says exactly what the person will and will not be able to do.
- **Emergency tasks page.** The grantee's only screen: one card per grant with a countdown and a button into the one allowed tool.
- **Import wizard.** Upload → dry-run summary (green valid, amber duplicates, red errors, with the first 100 problems) → Confirm → result. For old events: a small table to fill group rules. Download the problem rows as CSV.
- **Export dialog.** Column checkboxes from the role's whitelist, row count preview, warning text about personal data.
- **Data-quality panel.** Cards by issue with counts, each linking to a filtered page.
- **Analytics.** Cards at the top, gender donut and stacked bars (with counts), monthly trends, project comparison. Charts load lazily.
- **Settings.** Business settings for Coordinator/Tech; a "System" section (retention, audit caps, limits mode, emergency hours) and "Feature flags" for Coordinator and Mentors; the DB size gauge with the 350/425 MB marks.
- **Print sheet.** A clean black-and-white print stylesheet for an event's participants (name, roll, project, empty box).

### 18.7 Component rules

- shadcn/ui (Radix) for controls. Lucide icons. Sonner for toasts. TanStack Table for tables, with **server-side** paging, sorting and filtering. A column chooser on desktop.
- Forms: native inputs and Server Actions for simple forms; React Hook Form only for complex ones (event wizard, import wizard). Zod schemas are shared with the server.
- Validation errors appear next to the field, in plain words, and the first bad field is focused.
- Destructive actions use a confirmation; the permanent ones need a typed confirmation.
- Every list has a **loading skeleton**, an **empty state** (a short sentence and the next action), and an **error state** with a retry button.
- Status chips use the same colours everywhere: DRAFT grey, SCHEDULED blue, PUBLISHED green, ONGOING green pulse (none if reduced motion), RESCHEDULED amber, COMPLETED slate, CANCELLED red, ARCHIVED muted.
- Dates and times come from one formatter in `src/lib/time.ts`. Never format dates inline.
- Toasts for success; inline messages for errors that need a decision.

### 18.8 Words on screen (plain, short, not blaming)

| Situation | Message |
|---|---|
| `RATE_LIMITED` | You're going a bit fast. Try again in {n} seconds. |
| `LIMIT_EXCEEDED` (edit budget) | You've used all your changes for this. Ask a Coordinator or Tech member to change it. |
| `LIMIT_EXCEEDED` (slots) | {k} of {n} added. {m} are over the slot limit. Ask a Coordinator or Tech member to add the rest. |
| `LOCKED` | Attendance is locked now. A Coordinator or Tech member can correct it with a reason. |
| `NOT_FOUND` | We can't find that. It may not exist, or it may not be yours to see. |
| `FORBIDDEN` | You can see this, but you can't do that here. |
| `CONFLICT` | Someone saved this before you. Reload to see the latest. |
| `MAINTENANCE` | The portal is being fixed. Reading works; saving will be back soon. |
| `READ_ONLY` | The portal is in read-only mode for now. |
| `VALIDATION` | (field-specific text, for example "Roll number should be 6 to 10 digits, like 2605001") |
| `INTERNAL` | Something went wrong on our side. Nothing was saved. Try again, and tell the Tech team if it keeps happening (code: {correlationId}). |

### 18.9 Accessibility

- Aim for WCAG AA. Text contrast 4.5:1, large text 3:1, focus ring always visible.
- Everything works with a keyboard only. Dialogs trap focus and return it. Skip-to-content link.
- Real labels on every input. Buttons have text or an `aria-label`. Toasts use `aria-live="polite"`.
- Never use colour alone for meaning (chips have text; chart segments have labels and counts).
- Tables have proper headers; card views on phones keep the same reading order.
- Reduced motion, light/dark, and zoom to 200% are tested (Section 20).

### 18.10 Responsive checks

Test at 360, 390, 768, 1024, 1440 px. No horizontal scrolling on phones except inside a table container. Bottom navigation never covers the sticky action bar. Safe-area insets are respected on phones with a notch.

---

## 19. Operations and handover

### 19.1 Migrations

- Committed Drizzle SQL, run by CI or the admin connection, **never from the app**. Use the session-mode pooler if direct connections are IPv6-only (GitHub's runners are IPv4).
- The manual SQL in `drizzle/manual/*.sql` (security, functions, cron) is applied in order after the migrations.
- After adding a table: re-run the RLS block (8.7), check grants, and check `delete_volunteer_permanently()` if the table points at `volunteers` (rule 26).
- Schema changes stay backwards compatible for one release.

### 19.2 Backups

- Weekly `pg_dump -Fc` (compressed) of the `public` schema through the **session-mode** pooler (the transaction pooler cannot run `pg_dump`). Leave out `rate_limits` and `idempotency_keys`. Encrypt with `age`; the public key is in the repo, the private key is kept offline by the Tech lead and a Coordinator.
- Keep the last **4 weekly** dumps and **1 monthly** one as private artifacts and/or in the team's Drive. This keeps GitHub's free artifact storage (about 500 MB, verify) safe.
- Supabase Free has **no automatic backups**, so this job is the only safety net. Do not assume anything else.
- **Test a restore at least once per term** into a local Docker Postgres (the two free Supabase projects are already used by production and staging).
- Take a manual backup (`workflow_dispatch`) before risky actions: a retention run, a history import, deleting more than 10 volunteers.
- Deleted volunteers stay in old backups until those rotate out (about 5 weeks). If a deletion request is urgent, delete the old artifacts too.

### 19.3 Rollback and monitoring

- **Rollback:** Vercel keeps previous deployments; redeploy the last good one.
- **Monitoring:** Supabase dashboard (database size, egress), the Settings page gauge (size, last daily run in red if older than 36 hours), GitHub Actions failure e-mails, structured logs with correlation ids, and the **weekly look at the Vercel Usage page** (Section 9.3, 17.7).

### 19.4 Incidents and outages

- **Remove someone's access fast:** end or suspend their post (`access_status`), or a Coordinator suspends the volunteer. It takes effect on their next request. If an identity may be compromised, also rotate the database password and `CRON_SECRET`.
- **Flood or strange traffic:** switch on strict limits mode (17.7), then the maintenance flag, then **Attack Challenge Mode** in Vercel.
- **Vercel quota pause:** the site is down for about 30 days at worst. Plan: switch to Cloudflare (Section 2.5) using the files in `src/lib/platform/`, or ask the Vercel account owner to upgrade for a month. Write the exact steps in the runbook before it happens.
- **Supabase paused:** un-pause from the dashboard (runbook); then check the keep-alive workflow.
- **Manual fallback on event day:** the Tech team prints or exports the participant sheet beforehand (Print sheet). Mark on paper. After recovery, enter it as post-lock corrections with the reason "portal outage".

### 19.5 Runbook and yearly handover

`docs/RUNBOOK.md` has, step by step: deploy, rotate secrets, restore a backup, un-pause Supabase, run the daily job by hand, yearly rotation, retention run, size emergency, **restore office access** (the break-glass SQL, 4.10), seed the staff, add a table safely, and the quota-pause plan.

Yearly handover to new tech members:

- A README that runs the project on a clean machine, and a seed script with **synthetic** data.
- This SRS, and a recorded walkthrough.
- A checklist for rotating the roster, secrets, and GitHub / Vercel / Supabase ownership.
- **Account ownership.** Vercel Hobby is one person's account and has no team seats (Section 2.1). Do not tie the project to a student's personal account. Create a dedicated NSS tech account (its own Google account with 2-step verification; recovery codes kept offline by a Coordinator and the Tech lead) that owns GitHub, Vercel and Supabase, and hand that account over each year. Check each vendor's terms about shared accounts first. If they do not allow it, that is a reason to move to a plan that supports teams.

### 19.6 Verify before production

Hosting terms (Vercel Hobby, non-commercial), current Supabase and Vercel limits (Section 2.1), Google OAuth consent screen and domain restriction, `pg_cron` enabled, costs (must be ₹0), and the institute's data policy (16.3).

---

## 20. Testing and acceptance

Tools: Vitest + Testing Library (unit and component), Playwright (end-to-end and authorization), SQL constraint tests against a scratch database, GitHub Actions CI (lint, typecheck, test, build, bundle budget).

Before production **all** of these must pass.

**Access**

1. An unapproved Google identity gets no session, no private read, only the minimal denied page.
2. A non-`@kiit.ac.in` email, an unverified email, or an email whose first part does not match `ROLL_NUMBER_PATTERN` is denied.
3. A volunteer with no active post and no active emergency grant is denied. A suspended or archived volunteer, or a suspended or revoked post, is denied at the next request (reads and writes).
4. Only the people listed in 4.5 can grant each post. Granting needs an existing volunteer. Nobody can change their own access. The last Coordinator and the last Mentor cannot be removed.
5. Emergency access: a person with only a grant sees only the emergency page. A table-driven test checks every pack × every action against 4.9. Expired or revoked grants are denied. A self-grant is rejected. Phone, hostel, blood group, gender, city, notes and flags are never returned to a pack.
6. Changing `ROLL_NUMBER_PATTERN` in the config changes validation everywhere (test with two patterns) and needs no database migration.

**Authorization**

7. A PR cannot read another project's volunteers, analytics or exports through a URL, query string, action payload or export.
8. A Builder cannot open volunteer profiles, volunteer attendance, analytics or audit logs. A POC sees only name/roll/project, only in central events.
9. Out-of-scope IDs return `NOT_FOUND`.
10. Permissions are the union of posts: PR + POC gets both sets; PR + Tech gets Tech's powers.
11. The matrix in Section 5 is covered by a table-driven test: every row × every role, with Tech Mentor and Tech Member separate.
12. Tech cannot suspend, reinstate, archive or delete a volunteer (direct call returns `FORBIDDEN`). A request is created instead. A Coordinator approves and it runs. A Coordinator cannot decide a request about themselves. Tech cannot decide any request. A request expires after the set days.
13. "Who may act on whom": Tech cannot revoke a Coordinator; a Mentor can manage a Member; nobody can act on themselves.

**Data rules**

14. Duplicate event attendance and duplicate meeting attendance are rejected by the primary key.
15. A third PR in a project is rejected by `oa_pr_slot_uq`. The year check (S-07) blocks a Tech member's grant but a Coordinator can override with a reason.
16. Gender is required: create and import without it fail. City/state is optional. Gender counts add up to the total in analytics.
17. FCFS: a PR can only add own-project ACTIVE volunteers. Slot totals and year caps hold under concurrent requests. Over-limit rows are reported, not added. After the lock PRs, POCs and Builders are denied. A Coordinator/Tech can add walk-ins beyond slots, audited as `FCFS_EDIT`.
18. Attendance cannot be marked before T−15 minutes (except by Coordinator/Tech) and nobody can mark after the lock. Corrections need a reason. Previous values are kept. Counter deltas apply only when the item is already finalised.
19. Finalise is idempotent (run twice = same counters). Rates never exceed 100. An event or meeting where nobody took attendance is **not** finalised by the job. "Finalise without penalties" leaves every counter unchanged. A stuck `ONGOING` meeting is auto-completed and finalised.
20. Hours: a single event; the camp example (slum 4 + orphanage 5 → 50 with the camp rule); one event only; a tagged adjustment; the same tag twice on the same day is rejected; imported `legacy_hours` survive a recompute; a person corrected to ABSENT loses those hours after the recompute.
21. MOM: more than 100 words is rejected; creator and PR can edit for 7 days; Coordinator/Tech any time.
22. Collaboration: the event stays `DRAFT` until every invited project approves; either PR of a project can approve; a project not invited cannot; a Coordinator/Tech can force-approve with a reason.
23. Meeting creation permissions per type (11.8). Absence rules: 4th years are never counted absent but are counted present; Coordinators and Tech members are never counted absent; `join_date` after the meeting is not counted.
24. Edit budget: two changes are accepted after the first save and the third returns `LIMIT_EXCEEDED`; a no-op is not counted; a stale `expectedEditCount` returns `CONFLICT`; Coordinator/Tech are exempt; "Give 2 more edits" resets the counter; a save without `confirmed: true` is rejected.
25. Permanent delete: a test reads `pg_constraint` and fails if any foreign key to `volunteers` is not handled in `delete_volunteer_permanently()`. Deleting needs `ARCHIVED` and no active post. Old audit rows lose the roll number. `SYSTEM` cannot be deleted. The delete audit row stores only the count.
26. Imports: volunteer import dry-run and commit; old events + attendance create events, counters and hours; undo reverses them; duplicates are skipped; hours-only import **replaces**; an expired preview token is refused; a Coordinator/Tech import writes no audit row; a PR export writes one `CSV_EXPORT` row; turning on `audit_staff_csv` logs staff CSV actions.

**Audit and security**

27. Every sensitive write produces an audit row in the same transaction; if the audit insert fails the write rolls back. The only exceptions are the ones in 13.3.
28. `app_user` cannot `UPDATE` or `DELETE` `audit_log` (tested with a real connection). The purge works as the owner, by age and by the 50,000-row cap.
29. The `anon` and `authenticated` Supabase keys cannot read any table, and every table in `public` has RLS on.
30. Exports are bounded, authorised in SQL, column-whitelisted, formula-guarded, `no-store`. Notes are never exportable.
31. Caching: shared-cache functions never take `ActorContext` or a roll number; user B never gets user A's data; after sign-out the back button shows no private page; private routes send `no-store`; the client stale time is 30 s; live screens are fresh after the person's own save.

**Limits**

32. 200 quick page loads: the 121st returns 429 with `Retry-After`. Three trips in 10 minutes start a 5-minute cooldown. A Coordinator is never put in a cooldown.
33. A double-submitted create-event makes one event. The same edit sent 50 times adds no extra audit rows. Bulk caps hold (500 / 100 / 100). A second "recompute" while one runs is refused. `LOGIN_DENIED` rows stay within the cap.
34. With the limiter table unavailable, reads still work and exports, imports and bulk writes are refused.
35. `app_user` has the statement, lock and idle timeouts from 8.7.

**Free tier and operations**

36. A synthetic load test at the Section 1.4 volumes for 3.5 years keeps the database under about 180 MB and key pages inside the query budget (9.5).
37. A scripted "busy day" in staging shows average CPU per request ≤ 40 ms, and projects to ≤ 1.6 CPU hours and ≤ 400,000 invocations a month (9.3). The numbers are written in `docs/DATABASE.md`.
38. The keep-alive runs; the backup job produces a dump that restores in Docker.
39. The UI works on small phones, tablets and desktop; in light and dark; with the keyboard only; with reduced motion; at 200% zoom. Route bundles stay within the budget in 16.6.
40. Lint, typecheck, unit and end-to-end tests and the production build pass. A new tech member can run the project from the README on a clean machine.
41. Time: events that run past midnight lock after their last day; the academic year changes on 1 July IST; everything displays in IST with `en-IN` formats.
42. Seed: the script refuses rows with a blank name or gender, seeds the Coordinators and Tech from the filled file, and the first posts are granted by themselves.

---

## 21. Decision log and open decisions

### 21.1 Decisions made (and why)

| # | Decision | Reason |
|---|---|---|
| D-01 | Supabase Auth (Google) instead of Auth.js | One free vendor, no session tables; authorization stays in our own tables. |
| D-02 | The roster is `office_assignments`, which also holds role history | One source of truth, history for free. |
| D-03 | `year` is computed from `batch_year`; `email` is derived | No yearly bulk updates; no inconsistent copies. |
| D-04 | Volunteer arrays (events attended, meetings present, ...) are not fields; counters on the row + paginated history queries | Small payloads, small storage. |
| D-05 | Domains live in a junction table with a `since` date; "General Volunteering" is implicit | Analytics need overlap; the Domain Lead rule needs tenure. |
| D-06 | Meeting attendance stores only present people; absent is derived | About 60% less storage on the biggest table. |
| D-07 | Event `ONGOING` is derived, not stored | No cron needed for status. |
| D-08 | Event and meeting ids are numbers | Smaller keys. Authorization is in SQL, so guessing an id gives nothing. |
| D-09 | A camp's `full_hours` replaces the sum of its events, even if the sum is bigger | Matches how the NSS team counts it. Change here if they decide otherwise. |
| D-10 | Hours are computed (event hours + group rule + tagged adjustments + imported legacy hours) and rolled up per year | No per-volunteer-per-event hours table; survives event purge; imports are safe. |
| D-11 | Time is `Asia/Kolkata` (IST), shown with `en-IN` formats and a 12-hour clock | India specific, and the earlier "Asia/New Delhi" was not a valid zone. |
| D-12 | Audit retention is 30 days **and** 50,000 rows; long-lived corrections live in `attendance_corrections` | Protects the 500 MB budget even if someone floods the log. |
| D-13 | CSV import and export by Coordinator/Tech are **not logged**; CSV actions by anyone else are; setting `audit_staff_csv` can turn staff logging on | Asked for by the team. The risk is written down in 13.3. |
| D-14 | Hard rules and soft rules, with audited overrides by Coordinator/Tech | People make mistakes; the system must let them be fixed without database access. |
| D-15 | FCFS entry needs `PUBLISHED` or `RESCHEDULED`; `RESCHEDULED` is only reachable from `PUBLISHED` | Gives creators a review step and closes a gap. |
| D-16 | Permissions are the **union** of a person's posts. Rank (Coordinator > Tech Mentor > Tech Member > PR / POC > Builder, with PR first on project matters and POC first on central matters) only decides who may act on whom and what is shown | Holding a second post never removes powers. |
| D-17 | Gender is compulsory, FULL-only per person, and shown as a ratio in analytics. It is not enforced as a quota | The team wants to watch the ratio. |
| D-18 | City/state is optional | Asked for by the team. |
| D-19 | Roll numbers: loose DB check (4–20 letters/digits); the real pattern is `ROLL_NUMBER_PATTERN` in `src/config/identity.ts` (now 6–10 digits) | No fixed pattern is known. Tightening later needs no migration. |
| D-20 | 4th years stay ACTIVE and can earn hours. By default (`meeting_absence_years = [2,3]`) they are never counted absent in meetings | Placement preparation makes them miss meetings. Counting that as absence would ruin their numbers. Editable. |
| D-21 | Tech cannot suspend, reinstate, archive or permanently delete volunteers, and cannot start a retention run alone. Tech raises a request; a Coordinator approves | Asked for by the team. One-tap inbox keeps it easy. |
| D-22 | Emergency access is five narrow packs, each tied to one project, one event or one meeting, for up to 24 hours | Lets a Coordinator or Tech hand off one job without handing over the keys. |
| D-23 | Permanent delete is real, through a database function that points "who did it" columns at a `SYSTEM` row and cleans old audit rows | Foreign keys make a plain delete impossible; privacy needs a real delete. |
| D-24 | Edit budget: the first save is free, then 2 saved changes, with a Review → Confirm step | Keeps data tidy and cuts needless writes. Coordinators/Tech are exempt. |
| D-25 | Caching in tiers: shared aggregates on the server, 30 s client router cache, no private data in shared places | Protects the Vercel quotas and makes pages feel quick. |
| D-26 | Old data can be imported (volunteers, events + attendance, hours-only). `legacy_hours` is separate so the recompute never erases it | Accurate hours from day one. |
| D-27 | Lock = start of the next IST day; lock is separate from finalise; a locked event with no attendance is "needs review" and is not penalised automatically | Fixes edge cases and mass penalties. |
| D-28 | Tech has two kinds: Member (3rd year) and Mentor (4th year, a little more power) | Asked for by the team. |
| D-29 | Rate limiting lives in Postgres (unlogged tables), not in memory | In-memory counters do not work on serverless. |
| D-30 | Tagged hours adjustments (`adjustment_types`) with one-per-day-per-tag uniqueness | Same treatment for everyone. |
| D-31 | Snapshots (`eligible_count`, `present_count`, gender counts) are written on events and meetings at finalise | Correct turnout and cheap analytics. |

### 21.2 Open decisions (the default is used until the team decides)

| # | Question | Default used |
|---|---|---|
| Q-01 | Final hosting: Vercel Hobby or Cloudflare | Vercel Hobby, after checking its terms (2.1, 2.5). |
| Q-02 | Which powers should stay Coordinator-only? | As the matrix in Section 5. If Tech should be lighter, move `approve:hours`, `adjust:hours`, `correct:attendance` to Coordinator-only and let Tech reach them through emergency access. |
| Q-03 | Can builders edit central events they created? | Yes, only their own, only while not locked, inside the edit budget. |
| Q-04 | Which PRs may create central events? | All PRs. |
| Q-05 | Gender values | `MALE`, `FEMALE`, `OTHER`. |
| Q-06 | Meeting absence years | `[2,3]` (D-20). |
| Q-07 | Default FCFS entry window | 60 minutes. |
| Q-08 | Who is never counted absent in meetings | Coordinators and Tech members (and 4th years by D-20). |
| Q-09 | Is the list of five emergency packs enough? | Yes for v1. |
| Q-10 | Event and meeting retention | 42 months. |
| Q-11 | Privacy policy, data owner, deletion requests, export caps | Review with the institute before launch. Export cap 2,000 rows. |
| Q-12 | `SCHEDULED` events visible but closed to FCFS entry | Yes. |
| Q-13 | Is a Coordinator limited to some projects? | No, organisation-wide. |
| Q-14 | Should staff CSV actions be logged? | No (D-13). Revisit after the first term. |
| Q-15 | Import of old **meeting** attendance | Not in v1. Meeting counters start at go-live. |
| Q-16 | Gender-aware slots (limits per gender in an event) | Not in v1. |
| Q-17 | Is the edit budget per record (shared by both PRs) or per person? | Per record. |
| Q-18 | 12-hour or 24-hour clock | 12-hour with am/pm. |

---

## 22. Documentation to keep in the repo, and build order

| File | Content |
|---|---|
| `docs/SRS.md` | this document |
| `docs/PERMISSIONS.md` | Section 5 as a table, plus the permission-test matrix |
| `docs/DATABASE.md` | Section 8 as built, index notes, size and CPU measurements |
| `docs/AUDIT_POLICY.md` | Section 13, the immutability model, the two deliberate exceptions, the staff CSV decision |
| `docs/RUNBOOK.md` | Section 19 procedures, break-glass SQL, quota-pause plan |
| `docs/UI_SPEC.md` | tokens, navigation, components, responsive behaviour |
| `docs/DECISIONS.md` | dated decisions (start from 21.1) |
| `docs/AI_WORKFLOW.md` | Section 3 rules and the review process |
| `docs/PROGRESS.md` | done, validation results, next steps |

Any architectural or permission change updates the matching doc **in the same PR**. AI-generated work is reviewed, tested, and checked for stray files and dependency changes before it is merged.

### Build order for agents

1. Scaffold, CI, the two Supabase projects (production, staging), env, Drizzle, schema + security SQL + functions + seeds (Sections 8, Appendix A). Config files (Appendix C).
2. Auth, access gate, `ActorContext`, permission resolver, tiers, soft rules, `runAudited()`, limiter and idempotency (Section 17). Test the matrix.
3. Volunteers (list, profile, create, import), roster and access grant, requests inbox, red flags, notes.
4. Events: create, collaboration approval, FCFS entry, attendance, lock, finalise, corrections, edit budget.
5. Meetings: create, start, end, attendance, MOM, finalise.
6. Hours: categories, groups, approval, recompute, tagged adjustments. Then the old-data import.
7. Analytics (with gender), exports, audit viewer, settings, flags, emergency access, data-quality panel.
8. Caching pass (16.4), bundle check, backups, keep-alive, load test at 3.5-year volumes, the busy-day CPU test, the acceptance list.

A rough one-week plan for three people (a guide, not a rule): days 1–2 foundation (steps 1–2); day 3 volunteers and roster; day 4 events and attendance; day 5 meetings and hours; day 6 analytics, exports, requests, emergency; day 7 hardening and tests. If time runs short, the things that can follow the first release are: the old-data import, emergency packs, gender charts beyond the donut, and the print sheet. Everything in Sections 3, 4, 5, 8, 11.2 to 11.10, 16 and 17 must be in the first release.

---

## Appendix A. Seed data

### A.1 Projects (fixed ids)

| id | name | slug | SDGs |
|---|---|---|---|
| 1 | Bandhutva | bandhutva | 4, 17 |
| 2 | Dhara | dhara | 13, 14, 15 |
| 3 | Nidaan | nidaan | 3, 12 |
| 4 | Riddhi | riddhi | 8, 9 |
| 5 | Sanyukt | sanyukt | 16 |
| 6 | Sparsh | sparsh | 1, 2 |
| 7 | Swet | swet | 11 |
| 8 | Udaan | udaan | 5, 10 |
| 9 | Urja | urja | 6, 7 |

Taglines and descriptions: to be provided by the NSS team (empty strings until then; taglines should follow the SDGs). `accent_color` is chosen in the UI spec.

### A.2 Event categories (previous year's default hours; editable data, not code)

| Category | Hours |
|---|---|
| Old age home visit | 5 |
| Orphanage visit | 5 |
| Cleanliness drive | 3 |
| Plantation drive | 3 |
| Rally | 3 |
| Slum visit | 4 |
| School visit | 4 |
| Yoga Day event | 2 |
| Nukkad natak | 12 |
| Flash mob | 12 |
| Blood donation | 8 |
| NSS Day | 5 |
| Republic Day (participation) | 50 |
| Anna Daan | 8 |
| Sneh Daan | 4 |

### A.3 Hours adjustment tags (starter set; Tech and Coordinators edit them)

| Tag | Default hours |
|---|---|
| Photography at an event | 1 |
| Graphic design task | 2 |
| Video editing task | 2 |
| Content writing task | 2 |
| Position held (PR, POC, Domain Lead) | to be set by the team |
| Event performance (recognition) | to be set by the team |

These are only examples to start with. The team defines the real list.

### A.4 Settings defaults

| Key | Default |
|---|---|
| `audit_retention_days` | 30 (range 7–365) |
| `audit_max_rows` | 50000 |
| `fcfs_default_window_minutes` | 60 |
| `max_collab_projects` | 3 |
| `export_max_rows` | 2000 |
| `emergency_max_hours` | 24 |
| `edit_budget_revisions` | 2 |
| `mom_edit_days` | 7 |
| `meeting_absence_years` | `[2,3]` |
| `request_expire_days` | 14 |
| `audit_staff_csv` | false |
| `retention_months` | 42 (range 24–120) |
| `retention_purged_before` | null (set by the first retention run) |
| `limits_mode` | `"normal"` (or `"strict"`, 17.7) |
| `limits` | `{}` (overrides for `src/config/limits.ts`) |
| `flag.maintenance_mode` | false |
| `flag.exports_enabled` | true |
| `flag.fcfs_entry_enabled` | true |
| `flag.read_only` | false |
| `system.db_size_bytes`, `system.last_daily_run` | written by the daily job |

### A.5 Office staff seed (the first people who can log in)

These are the first Coordinators and Tech members. The roll number is the part of the email before the `@`. **Batch year and post are filled in. Every personal field is left blank for the team to fill.**

How it works:

- The committed template is `seed/staff.template.csv`. The filled file goes in `seed/local/staff.csv`, which is **git-ignored** (names and phone numbers never go into the repo).
- Required to fill: `name` and `gender`. Optional: `phone`, `hostel`, `blood_group`, `city_state`, `project`. Staff do not have to belong to a project.
- The **4th-year Tech Team (Mentors)** are not listed yet. Add one row each with `batch_year` 2023, `post` `TECH_TEAM`, `tech_kind` `MENTOR`, and their own `roll_number` and `email`. They have a little more access than the 3rd-year Tech Members (Section 5.2).
- `scripts/seed.ts` runs on the **admin** connection and works in one transaction, **all or nothing**: it checks every row with the same Zod schemas as the app. If any row has a blank `name` or `gender`, or a roll number that does not match `ROLL_NUMBER_PATTERN`, it prints the list of problems (row and field, never the personal data) and writes nothing. Otherwise it inserts the volunteers (`on conflict do nothing`; existing rows are never overwritten) and the posts, with `granted_by` set to the person themselves. It checks that at least one Coordinator row exists. It can safely run twice. There is no audit row; write the date in the runbook log.
- Staging and development use `seed/staff.dev.csv` (fake names and fake roll numbers only).

```csv
roll_number,email,name,gender,phone,hostel,blood_group,city_state,project,batch_year,post,tech_kind
# Coordinators (4th year)
2328051,2328051@kiit.ac.in,,,,,,,,2023,COORDINATOR,
2328181,2328181@kiit.ac.in,,,,,,,,2023,COORDINATOR,
23053452,23053452@kiit.ac.in,,,,,,,,2023,COORDINATOR,
23052425,23052425@kiit.ac.in,,,,,,,,2023,COORDINATOR,
23053133,23053133@kiit.ac.in,,,,,,,,2023,COORDINATOR,
2329124,2329124@kiit.ac.in,,,,,,,,2023,COORDINATOR,
2306220,2306220@kiit.ac.in,,,,,,,,2023,COORDINATOR,
23051409,23051409@kiit.ac.in,,,,,,,,2023,COORDINATOR,
23053436,23053436@kiit.ac.in,,,,,,,,2023,COORDINATOR,
# Tech Team Members (3rd year)
2405793,2405793@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
24155354,24155354@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
24157029,24157029@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
24051698,24051698@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
24155456,24155456@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
24155598,24155598@kiit.ac.in,,,,,,,,2024,TECH_TEAM,MEMBER
# Tech Team Mentors (4th year): add one row each, for example
# <roll_number>,<roll_number>@kiit.ac.in,,,,,,,,2023,TECH_TEAM,MENTOR
```

### A.6 The `SYSTEM` row

One row in `volunteers` with `roll_number = 'SYSTEM'`, `status = 'ARCHIVED'` (created in 8.7). It stands in for "imported record" and "removed person". It is hidden from every list, count, chart, export and dropdown (rule 27).

### A.7 Development data

Synthetic only. A script generates about 950 fake volunteers (fake roll numbers, names, phones, genders), 18 PRs, 9 Coordinators, 6 Tech Members, 3 Mentors, and 3.5 years of events and meetings at the Section 1.4 volumes, to test the 500 MB budget and the CPU budget. A second script generates a fake "old data" folder (volunteers, events, attendance, hours) to test the imports.

---

## Appendix B. Glossary

| Term | Meaning |
|---|---|
| FCFS | First come first served seat registration. Runs outside this portal; PRs enter the resulting names here. |
| PR | Project Representative. Exactly 2 per project, 3rd years, equal authority. |
| POC | Point-of-contact builder. Sees name/roll/project in central events and marks central attendance. |
| Domain Lead | Builder leading a creative domain. |
| Builder | The group of POCs, Domain Leads and general builders (PRs are also part of builders). |
| Tech Member / Tech Mentor | Tech Team members (3rd year) and the 4th-year guides with a little more access. |
| Central event | Organisation-wide event across projects. |
| Project event | Event hosted by 1–3 projects. |
| Mega event / event group | A camp or drive made of several events, with special hours rules. |
| Post / office assignment | A volunteer's role with start and end dates. It is both the access list and the role history. |
| Tier | Rank used to decide who may act on whom (4.3). |
| Hard rule / soft rule | A rule nobody can bypass / a guardrail that a Coordinator or Tech member can override with a reason (3.2). |
| Edit budget | How many saved changes a PR, POC or Builder gets on one record (11.2). |
| Review → Confirm | The two-step save. Draft in the browser, one server call on Confirm. |
| Request | A Tech member's ask for a Coordinator to suspend, archive or delete volunteers (4.8). |
| Emergency pack | A narrow, short-lived permission tied to one project, event or meeting (4.9). |
| Lock | Attendance becomes read-only (start of the next IST day, or an early manual lock). After it, only corrections with a reason. |
| FCFS lock | The time after which PRs can no longer add names. |
| Finalise | One-time step after the lock that applies counters and marks the event or meeting completed. |
| Needs review | A locked event or meeting where nobody took attendance. It is not penalised until a Coordinator or Tech member decides. |
| Walk-in | A person added by Coordinator/Tech after the FCFS lock or beyond the slots. |
| Counters | The cached numbers on `volunteers` (Section 8.2). |
| Snapshot | Totals written on an event or meeting at finalise (eligible, present, gender split). |
| Legacy hours | Hours imported from old records. Never touched by the recompute. |
| Tag (adjustment type) | A named kind of extra hours with a default value, made by Tech/Coordinators. |
| Shared aggregate cache | Server cache of non-personal counts (16.4). |
| Strict mode | A limits preset used when a free quota runs high (17.7). |

---

## Appendix C. Config files

`src/config/identity.ts`

```ts
// Everything about "who is a valid person" lives here and nowhere else.
export const EMAIL_DOMAIN = "kiit.ac.in";

// Roll numbers have no known fixed pattern yet. Seen so far: 2605001 (7 digits), 24051698 (8 digits).
// This accepts 6 to 10 digits. If a stable pattern is ever confirmed, tighten it HERE (for example /^[0-9]{7,8}$/).
// The database check is deliberately looser (letters and digits, 4 to 20 long), so changing this needs no migration.
export const ROLL_NUMBER_PATTERN = /^[0-9]{6,10}$/;
export const ROLL_NUMBER_HINT = "6 to 10 digits, like 2605001 or 24051698";

export const emailFromRoll = (roll: string) => `${roll}@${EMAIL_DOMAIN}`;

export function rollFromEmail(email: string): string | null {
  const [local, domain] = email.trim().toLowerCase().split("@");
  return domain === EMAIL_DOMAIN && ROLL_NUMBER_PATTERN.test(local ?? "") ? local! : null;
}

// Only a hint, used for warnings in imports ("this roll looks like batch 2024, the file says 2023"). Never trusted.
export function batchYearHintFromRoll(roll: string): number | null {
  const yy = Number(roll.slice(0, 2));
  return Number.isInteger(yy) && roll.length >= 6 ? 2000 + yy : null;
}
```

`src/config/app.ts`

```ts
export const TZ = "Asia/Kolkata";                 // India Standard Time
export const LOCALE = "en-IN";
export const HOUR12 = true;
export const ACADEMIC_YEAR_START_MONTH = 7;       // 1 July
export const ATTENDANCE_OPEN_LEAD_MINUTES = 15;   // soft rule S-04
export const MOM_MAX_WORDS = 100;
export const PRS_PER_PROJECT = 2;
export const PROJECT_ACTIVE_WINDOW_DAYS = 15;
export const MAX_PAGE_SIZE = 50;
export const REQUEST_MAX_TARGETS = 200;
export const REQUEST_DELETE_MAX_TARGETS = 50;
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export const PROJECT_NAMES = ["Bandhutva","Dhara","Nidaan","Riddhi","Sanyukt","Sparsh","Swet","Udaan","Urja"] as const;
```

`src/config/limits.ts`

```ts
// Defaults for every limit in Section 17 and for the settings in Appendix A.4.
// settings.limits (editable in the UI) overrides these. settings.limits_mode = "strict" applies STRICT_OVERRIDES.
export const LIMITS = {
  readPerMinute: 120,
  writePerMinute: 30,
  writePerDay: 1000,
  bulkPerMinute: 10,
  staffMultiplier: 3,                // Coordinator and Tech: x3 on read, write and bulk; no cooldown
  exportsConcurrent: 1, exportsPerHour: 3, exportsPerDay: 10, exportMaxRows: 2000,
  importsPerDay: 3, importMaxRows: 1000, importHistoryMaxEvents: 200, importHistoryMaxAttendanceRows: 5000,
  csvMaxBytes: 1_000_000, bodyMaxBytes: 1_000_000,
  createsPerDay: 20, maxOpenDrafts: 10,
  heavyJobCooldownSeconds: 300,
  deniedLoginsPerIpPer10Min: 20, deniedLoginAuditPerIdentityPerHour: 1, deniedLoginAuditPerDay: 200,
  auditRowsPerActorPerDay: 1000, auditMaxRows: 50000,
  rollsPerCall: { attendance: 500, fcfs: 100, hoursAdjust: 100 },
  pendingRequestsPerTech: 10,
  emergency: { activePerGrantee: 3, activePerGrantor: 10, maxHours: 24 },
  adjustmentsPerVolunteerPerYear: 50,
  tripsBeforeCooldown: 3, tripWindowMinutes: 10, cooldownMinutes: 5,
  editBudgetRevisions: 2, momEditDays: 7, fcfsDefaultWindowMinutes: 60, maxCollabProjects: 3,
  meetingAbsenceYears: [2, 3], requestExpireDays: 14, retentionMonths: 42, auditRetentionDays: 30,
  dbSizeWarnMB: 350, dbSizeReadOnlyMB: 425,
  edgeRateLimitPerIpPerMinute: 600,  // the Vercel firewall rule (17.2); kept here so the number is written down
} as const;

export const STRICT_OVERRIDES = {
  readPerMinute: 60, writePerMinute: 15, exportsPerHour: 1, cacheTtlMultiplier: 2,
} as const;
```

---

## Appendix D. Environment variables

| Name | Where | Used for |
|---|---|---|
| `DATABASE_URL` | Vercel (server) | Transaction pooler URL for `app_user` |
| `ADMIN_DATABASE_URL` | GitHub Actions (CI only) | Migrations, seed, backups (session-mode pooler) |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Starting Google sign-in |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Starting Google sign-in only |
| `CRON_SECRET` | Vercel + GitHub | Bearer token for `/api/cron/*` |
| `APP_ORIGIN` | Vercel | Origin checks for Route Handlers |
| `AGE_PUBLIC_KEY` | GitHub | Encrypting backups (the private key is never online) |

There is **no** service-role key anywhere in the app. Staging and production use different values for everything.