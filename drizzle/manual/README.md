# Manual SQL

These files are applied **after** the generated Drizzle migrations, using the
admin/session connection (`ADMIN_DATABASE_URL`). They never run from the Next.js
application and never use `DATABASE_URL`.

```bash
npm run db:migrate
npm run db:security
```

`npm run db:security` is the script form of
`psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/manual/security.sql`; it
exists because psql is not installed on every developer machine. Both commands
read `ADMIN_DATABASE_URL`.

Run both commands with the same admin role. `security.sql` sets default
privileges for objects created by that role; migrations run by a different role
would not inherit those defaults.

## Current files

| File | SRS | Contents |
|---|---|---|
| `security.sql` | 8.7 | `app_user` role, least-privilege grants, audit restrictions when `audit_log` exists, revocation from `anon`/`authenticated`, RLS on every public table, role timeouts, and the `SYSTEM` row. |

`security.sql` is repeatable. It creates the role only when missing, drops and
recreates its own policies, and inserts the `SYSTEM` row with
`ON CONFLICT DO NOTHING`.

## Application role password

The password is not committed. Create the role from this file (or the Supabase
dashboard), then set the password from the secret store:

```sql
alter role app_user password '<from secret store>';
```

The runtime `DATABASE_URL` must use `app_user` through the Supavisor
transaction pooler on port 6543. Migrations use `ADMIN_DATABASE_URL` on the
session connection (port 5432 or the session-mode pooler).

## Deliberately deferred

The following SRS 8.7 blocks cannot be applied to the current foundational
schema. Creating partial versions would be unsafe.

| Deferred item | Depends on | Why it is deferred |
|---|---|---|
| `purge_audit_log()` and the `audit-retention` `pg_cron` schedule | `audit_log`, `settings`, `pg_cron` | None of those objects exist in the foundational group. `pg_cron` must be enabled on the target project first. |
| `delete_volunteer_permanently(text)` | `office_assignments`, `event_participants`, `meeting_attendance`, `attendance_corrections`, `hours_adjustments`, `volunteer_year_hours`, `red_flags`, `emergency_grants`, `events`, `event_groups`, `event_projects`, `meetings`, `settings`, `approval_requests` | SRS 8.7 and rule 26 require it to handle **every** foreign key pointing at `volunteers`. A partial function would fail or leave orphaned data when those tables arrive. |
| Counter maintenance functions | `events`, `event_participants`, `meetings`, `meeting_attendance`, `red_flags`, `volunteer_year_hours` | SRS 11.10 puts counter changes in TypeScript feature functions, not database functions. The stored counters are already created; no database trigger or generic counter function is authorized. |
| Retention operations (event/meeting purge, decided-request purge, helper-table cleanup) | Later tables and the daily job | The retention rules are application transactions, not standalone DDL. |

The foundational schema currently has exactly two foreign keys pointing at
`volunteers`:

| Child column | Required permanent-delete action |
|---|---|
| `volunteer_domains.roll_number` | Delete the person's domain rows. |
| `volunteers.notes_updated_by` | Update other people's rows to `SYSTEM`. |

Before `delete_volunteer_permanently()` is created, those two actions must be
part of it. Every later FK to `volunteers` must be added to the function in the
same migration (SRS rule 26).

When the dependent schema groups are added, extend `security.sql` (or add
ordered files here) and re-run it. The RLS loop automatically covers new public
tables, but the audit revocation and both functions must be rechecked.

## Local validation

A disposable PostgreSQL instance is enough, but it must have the Supabase API
roles because the SRS revokes their access:

```sql
create role anon nologin;
create role authenticated nologin;
```

For local connection tests, set a temporary password on `app_user` (never in
the repo):

```sql
alter role app_user password 'local-test-only';
```

## Known limitations

- No live Supabase project was contacted. Supabase-specific role membership,
  session-mode pooler behavior and `pg_cron` availability remain unverified.
- The runtime app can update the cached counter columns because SRS 8.7 grants
  table-wide `UPDATE`; the "counters only through the named functions" rule is
  enforced by application code and review, not by column privileges.
- `audit_log` is absent, so audit immutability is not yet enforceable in this
  database. The guarded block in `security.sql` applies the restrictions once
  the table exists.
