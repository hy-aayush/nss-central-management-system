/**
 * Audit immutability under the application's database role (SRS rule 7,
 * Section 8.7 and acceptance criterion 28).
 *
 * `audit_log` belongs to a later schema group, so this test creates the SRS 8.6
 * shape in a scratch database, applies the real `drizzle/manual/security.sql`,
 * and then connects as the real `app_user`. The guarded block in security.sql
 * is what is being verified; nothing is mocked.
 *
 * The temporary table uses `text` for `actor_role` and `outcome` because the
 * `user_role` / `audit_outcome` enums arrive with the office-assignment schema
 * group. Column types do not affect the privilege rules under test.
 */

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { applyManualSql, runMigrations } from "../../scripts/lib/database-ops";
import {
  connect,
  createScratchDatabase,
  expectPgError,
  type ScratchDatabase,
  type TestSql,
} from "./harness";

const STAND_IN_AUDIT_LOG = `
  create table audit_log (
    id             bigint generated always as identity primary key,
    at             timestamptz not null default now(),
    actor_roll     text,
    actor_role     text,
    action         text not null,
    entity_type    text not null,
    entity_id      text not null,
    entity_label   text check (char_length(entity_label) <= 120),
    target_roll    text,
    project_id     smallint,
    outcome        text not null default 'SUCCESS',
    correlation_id uuid not null,
    reason         text check (char_length(reason) <= 300),
    summary        text not null check (char_length(summary) <= 280),
    changes        jsonb,
    client_ip      inet
  )
`;

describe("audit_log is append-only for app_user", () => {
  let scratch: ScratchDatabase;
  let app: TestSql;

  beforeAll(async () => {
    scratch = await createScratchDatabase("audit", { migrate: false });
    await runMigrations(scratch.adminUrl);
    await scratch.admin.unsafe(STAND_IN_AUDIT_LOG);
    await applyManualSql(scratch.adminUrl, "security.sql");
    app = connect(await scratch.enableAppRole());
  });

  afterAll(async () => {
    await app.end({ timeout: 5 });
    await scratch.cleanup();
  });

  it("enables RLS and installs only the read/insert policies", async () => {
    const [rls] = await scratch.admin<{ relrowsecurity: boolean }[]>`
      select relrowsecurity from pg_class where oid = 'public.audit_log'::regclass
    `;
    expect(rls?.relrowsecurity).toBe(true);

    const policies = await scratch.admin<{ policyname: string; cmd: string }[]>`
      select policyname, cmd from pg_policies
      where schemaname = 'public' and tablename = 'audit_log'
      order by policyname
    `;
    expect(policies).toEqual([
      { policyname: "audit_insert", cmd: "INSERT" },
      { policyname: "audit_read", cmd: "SELECT" },
    ]);
  });

  it("grants SELECT and INSERT but not UPDATE, DELETE or TRUNCATE", async () => {
    const [privileges] = await scratch.admin<
      {
        can_select: boolean;
        can_insert: boolean;
        can_update: boolean;
        can_delete: boolean;
        can_truncate: boolean;
      }[]
    >`
      select
        has_table_privilege('app_user', 'public.audit_log', 'SELECT') as can_select,
        has_table_privilege('app_user', 'public.audit_log', 'INSERT') as can_insert,
        has_table_privilege('app_user', 'public.audit_log', 'UPDATE') as can_update,
        has_table_privilege('app_user', 'public.audit_log', 'DELETE') as can_delete,
        has_table_privilege('app_user', 'public.audit_log', 'TRUNCATE') as can_truncate
    `;
    expect(privileges).toEqual({
      can_select: true,
      can_insert: true,
      can_update: false,
      can_delete: false,
      can_truncate: false,
    });
  });

  it("lets app_user append and read an audit row", async () => {
    const [inserted] = await app<{ id: string }[]>`
      insert into audit_log (action, entity_type, entity_id, correlation_id, summary)
      values (
        'VOLUNTEER_UPDATE',
        'volunteer',
        '8800600',
        ${randomUUID()},
        'Synthetic audit test row'
      )
      returning id
    `;
    expect(inserted?.id).toBeTruthy();

    const [count] = await app<{ count: number }[]>`
      select count(*)::int as count from audit_log
    `;
    expect(count?.count).toBe(1);
  });

  it("refuses UPDATE from app_user", async () => {
    await expectPgError(
      app`update audit_log set summary = 'tampered' where action = 'VOLUNTEER_UPDATE'`,
      { code: "42501" },
    );
  });

  it("refuses DELETE from app_user", async () => {
    await expectPgError(
      app`delete from audit_log where action = 'VOLUNTEER_UPDATE'`,
      { code: "42501" },
    );
  });

  it("refuses TRUNCATE from app_user", async () => {
    await expectPgError(app`truncate table audit_log`, { code: "42501" });
  });

  it("leaves the row intact after the refused writes", async () => {
    const [count] = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from audit_log
    `;
    expect(count?.count).toBe(1);

    const [row] = await scratch.admin<{ summary: string }[]>`
      select summary from audit_log where action = 'VOLUNTEER_UPDATE'
    `;
    expect(row?.summary).toBe("Synthetic audit test row");
  });

  it("keeps anon and authenticated out of audit_log", async () => {
    const [privileges] = await scratch.admin<
      { anon_select: boolean; authenticated_select: boolean }[]
    >`
      select
        has_table_privilege('anon', 'public.audit_log', 'SELECT') as anon_select,
        has_table_privilege('authenticated', 'public.audit_log', 'SELECT') as authenticated_select
    `;
    expect(privileges).toEqual({
      anon_select: false,
      authenticated_select: false,
    });
  });
});
