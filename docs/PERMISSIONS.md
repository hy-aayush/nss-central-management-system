# NSS Central Management System — Role & Permissions Specification

> Matches **docs/SRS.md Sections 3, 4, 5, 6, 10.1** and the institutional security model.

---

## 1. Access Model & Gating

- **Roster-Gated Identity (Rule 1)**: Authentication alone via Google Workspace is insufficient. The user's roll number (extracted from `<rollNumber>@kiit.ac.in`) must match an active entry in `office_assignments`.
- **Universal Volunteer Hierarchy**: Every staff member is fundamentally a `Volunteer` whose operational role rotates annually in `office_assignments`.
- **ActorContext (Server-Built)**: Every request builds an authoritative `ActorContext` containing:
  - `rollNumber`, `name`
  - `primaryRole`, `tier` (1 to 5)
  - `roles`: union of active assignments
  - `techKind`: `MEMBER` or `MENTOR`
  - `builderKind`: `GENERAL`, `POC`, or `DOMAIN_LEAD`
  - `projectScope`: list of project IDs (for PRs)
  - `permissions`: union of granted actions
  - `emergency`: active scoped packs
  - `correlationId`: UUID for tracing and audit logging

---

## 2. Post Hierarchy & Tiers (Section 4.3)

| PostKind | Tier | Typical Year | Notes |
|---|:---:|:---:|---|
| **COORDINATOR** | 5 | 4th year | Organization governance; approves requests; overrides soft rules. |
| **MENTOR** (Tech Team) | 4 | 4th year | Guides tech team; full technical and settings access. |
| **MEMBER** (Tech Team) | 3 | 3rd year | Day-to-day data and technical operations; raises requests. |
| **PR** (Project Representative) | 2 | 3rd year | Exactly 2 per project; equal authority over project volunteers. |
| **POC** (Point-of-Contact) | 2 | 2nd/3rd year | Central event attendance marker; sees basic fields only. |
| **BUILDER** / Domain Lead | 1 | 2nd/3rd year | Logistics, stage, creative domain work; zero personal data access. |
| **Emergency-only** | 0 | Any | Narrow, short-lived grant (max 24h) for one task. |

---

## 3. Two-Man Rule for Destructive Actions (Section 4.8)

A single user cannot unilaterally suspend, archive, or permanently delete volunteers:
1. **Initiation**: A Tech Team Member raises a request with written justification (`REQUEST_CREATE`).
2. **Approval**: A Coordinator reviews the targets and approves (`REQUEST_APPROVE`) or rejects (`REQUEST_REJECT`).
3. For deletion, the Coordinator must type `DELETE <N>` as confirmation.
4. All steps are permanently recorded in `audit_log`.

---

## 4. Emergency Access Packs (Section 4.9)

Emergency access provides short-lived (max 24 hours), narrow help for operational contingencies:
- `PROJECT_VIEW_BASIC`: View basic volunteer list for one project.
- `PROJECT_EDIT_BASIC`: Edit non-sensitive project notes or details.
- `EVENT_FCFS`: Enter FCFS names for one project's slot in an event.
- `EVENT_ATTENDANCE`: Mark attendance for one specific event.
- `MEETING_RUN`: Start, conduct, mark attendance, and submit MOM for one meeting.

---

## 5. Volunteer Data Sharing & Masking Rules (Section 6)

| Viewer Role | Volunteer's Affiliation | Visible Fields | Masked / Hidden Fields |
|---|---|---|---|
| **Coordinator / Tech Team** | Any Project | **FULL**: Roll, Name, Email, Phone, Project, Domains, Year, Blood Group, Hours, Attendance % | None (Full Access, Customizable CSV/Excel export) |
| **Project Representative** | Same Project | **FULL**: Roll, Name, Email, Phone, Project, Domains, Year, Blood Group, Hours, Notes | None |
| **Project Representative** | Other Project (Joint Event) | **BASIC**: `rollNumber`, `name`, `project` | Phone, Email, Blood Group, Year, Personal Notes, Attendance History |
| **POC / Builder** | Central Event Attendees | **BASIC**: `rollNumber`, `name`, `project` | Phone, Email, Blood Group, Year, Personal Notes, Attendance History |
| **Builder** | General Volunteers | **NO ACCESS** (0 records) | All Records Hidden |

---

## 6. Soft Rules & Guardrails (Section 3.2)

Soft rules protect against operational mistakes. Coordinators and Tech Members can override them with a written reason:

| Code | Guardrail | Normal Boundary | Override Behavior |
|---|---|---|---|
| **S-01** | Event project slot limits | Max registered cannot exceed assigned slots | Coordinator/Tech adds walk-in |
| **S-02** | FCFS registration window | Closes at `fcfs_lock_at` (default 60 min) | Coordinator/Tech reopens window or inserts rolls |
| **S-03** | Max collaborating projects | 1 host + up to 2 collaborators (3 total) | Coordinator approves 4+ project mega-drives |
| **S-04** | Attendance window | Opens 15 min before `starts_at`, locks at next IST day | Coordinator/Tech unlocks past event for corrections |
| **S-05** | MOM editing window | 7 days after meeting completion | Coordinator grants revision budget |
| **S-06** | Edit budget | 2 saved edits on details/FCFS per record | Coordinator grants additional edits |
| **S-07** | Year-level caps | Optional per-year quotas (e.g. max 15 2nd-years) | PR warning; Coordinator overrides |
| **S-08** | Consecutive meeting absence | 2 unexcused absences trigger review | Coordinator decides penalty or excuse |
| **S-09** | Minimum domain lead tenure | >40 service hours and 3+ months domain tenure | Warning on assignment; Coordinator overrides |

---

## 7. Complete Role-Action Permission Matrix (Section 5)

| Permission Token | Coordinator | Tech Mentor | Tech Member | PR | POC | Builder |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `view:dashboard:organization` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:dashboard:project` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `view:volunteers:all` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:volunteers:project` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `view:event:central:assigned_volunteers` | ✅ (Full) | ✅ (Full) | ✅ (Full) | ✅ (Own Full, Others Basic) | ✅ (Basic) | ❌ |
| `view:event:project:assigned_volunteers` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `view:events:scheduled_and_ongoing:all` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `view:events:past:all` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:events:past:central` | ✅ | ✅ | ✅ | ✅ (Own) | ✅ (Stats only) | ❌ |
| `view:events:past:project` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `view:analytics:cross_project` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `view:analytics:project` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `view:audit_logs` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `create:event:central` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create:event:project` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `create:volunteer` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `correct:attendance` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage:event:attendance` | ✅ | ✅ | ✅ | ✅ (Own) | ✅ (Central) | ❌ |
| `manage:event:fcfs` | ✅ | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| `manage:meeting:attendance` | ✅ | ✅ | ✅ | ✅ (Own) | ✅ (Central) | ❌ |
| `manage:roster` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `edit:event:fcfs` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `edit:volunteer:affiliations` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `approve:hours` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `export:csv:bounded` | ✅ (All) | ✅ (All) | ✅ (All) | ✅ (Own) | ❌ | ❌ |
| `request:raise` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `request:decide` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
