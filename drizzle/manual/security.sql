-- ============================================================================
-- drizzle/manual/security.sql
--
-- SRS 8.7: database roles, grants, RLS, role timeouts and the SYSTEM row.
--
-- Apply AFTER the generated migrations, with the admin/session connection:
--   psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/manual/security.sql
--
-- This file is deliberately repeatable:
--   - the app role is created only when missing;
--   - grants are idempotent;
--   - policies are dropped and recreated by name;
--   - the SYSTEM row uses ON CONFLICT DO NOTHING.
--
-- The app_user password is NEVER stored in this repository. Set it from the
-- secret store (Vercel/GitHub) or the Supabase dashboard:
--   alter role app_user password '<from secret store>';
--
-- DEFERRED SRS 8.7 BLOCKS (see drizzle/manual/README.md):
--   - purge_audit_log() and the pg_cron schedule need audit_log + settings.
--   - delete_volunteer_permanently() needs every table that points at
--     volunteers. Creating a partial version now would silently break SRS
--     rule 26 and 11.13 when those tables are added.
--   They must be added with the schema groups that create their dependencies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Application role
--
-- SRS 8.7 says "create role app_user login password ...". The password cannot
-- live in a committed SQL file, so this block creates the login role without a
-- password and the operator sets the password out-of-band. Explicitly enforce
-- the least-privilege attributes even if the role already existed.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_user') then
    create role app_user login;
  end if;
end
$$;

alter role app_user login nosuperuser nocreatedb nocreaterole nobypassrls;

revoke create on schema public from app_user;
grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant usage, select on all sequences in schema public to app_user;

-- Future migration tables/sequences get the same app grants automatically.
-- These defaults apply to objects created by the role running this script, so
-- run migrations and this file with the same admin role.
alter default privileges in schema public
  grant select, insert, update, delete on tables to app_user;
alter default privileges in schema public
  grant usage, select on sequences to app_user;

-- ---------------------------------------------------------------------------
-- 2) Audit is append-only for the application
--
-- audit_log is not part of the foundational schema group yet. This guarded
-- block becomes active when that table exists and this file is re-run after
-- adding it, as SRS 19.1 requires. It does not hide failures: the statements
-- run normally once the table is present.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.audit_log') is not null then
    -- app_user keeps SELECT and INSERT from the broad grant above.
    revoke update, delete, truncate on table public.audit_log from app_user;

    drop policy if exists audit_read on public.audit_log;
    drop policy if exists audit_insert on public.audit_log;

    create policy audit_read
      on public.audit_log for select to app_user using (true);
    create policy audit_insert
      on public.audit_log for insert to app_user with check (true);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3) Supabase's public API roles get nothing
--
-- These roles exist on Supabase. A vanilla local PostgreSQL used for
-- validation must create them first:
--   create role anon nologin;
--   create role authenticated nologin;
-- Failing loudly when they are absent is intentional: skipping the revoke
-- would silently weaken the SRS 16.3 requirement.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) RLS on every current and future public table
--
-- app_user is the only role with a policy. The policy allows all rows because
-- project/role scope is enforced in SQL by the application repositories
-- (SRS 3.1 rules 1-5); RLS here prevents the public Supabase API keys from
-- reaching the tables at all. audit_log has its own select/insert policies.
--
-- Re-run this file after adding any table (SRS 19.1). The loop is idempotent
-- because it drops its own policy names before recreating them.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);

    if t <> 'audit_log' then
      execute format('drop policy if exists app_all on public.%I', t);
      execute format(
        'create policy app_all on public.%I for all to app_user using (true) with check (true)',
        t
      );
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 5) Keep one bad query from hurting every other connection
--
-- Imports and the counter rebuild may raise these with SET LOCAL inside their
-- own transaction (SRS 8.7).
-- ---------------------------------------------------------------------------
alter role app_user set statement_timeout = '8s';
alter role app_user set lock_timeout = '3s';
alter role app_user set idle_in_transaction_session_timeout = '10s';

-- ---------------------------------------------------------------------------
-- 6) The SYSTEM row (Appendix A.6)
--
-- It stands in for imported and removed records. 'SYSTEM' passes the loose
-- roll-number check, and batch_year 2000 is inside the SRS range. The row is
-- hidden from application lists by rule 27, not by the database.
-- ---------------------------------------------------------------------------
insert into public.volunteers (roll_number, name, gender, batch_year, status)
values ('SYSTEM', 'System (imported or removed records)', 'OTHER', 2000, 'ARCHIVED')
on conflict (roll_number) do nothing;
