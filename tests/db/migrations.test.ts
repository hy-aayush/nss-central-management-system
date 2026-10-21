/**
 * Migration application and manual security SQL.
 *
 * Everything here runs against real PostgreSQL: a scratch database is created,
 * the committed migration is applied by the same helper the documented command
 * `npm run db:migrate` uses (Drizzle's migrator + `drizzle/` folder), and the
 * catalog is then inspected directly.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { applyManualSql, runMigrations } from "../../scripts/lib/database-ops";
import { createScratchDatabase, type ScratchDatabase } from "./harness";

const EXPECTED_TABLES = [
  "office_assignments",
  "projects",
  "volunteer_domains",
  "volunteers",
];

const EXPECTED_ENUMS = {
  access_status: ["ACTIVE", "SUSPENDED", "REVOKED"],
  blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  builder_kind: ["GENERAL", "POC", "DOMAIN_LEAD"],
  creative_domain: [
    "PHOTOGRAPHY",
    "VIDEO_EDITING",
    "GRAPHIC_DESIGNING",
    "CONTENT_WRITING",
  ],
  gender: ["MALE", "FEMALE", "OTHER"],
  tech_kind: ["MEMBER", "MENTOR"],
  user_role: [
    "COORDINATOR",
    "TECH_TEAM",
    "BUILDER",
    "PROJECT_REPRESENTATIVE",
  ],
  volunteer_status: ["ACTIVE", "SUSPENDED", "ARCHIVED"],
};

const EXPECTED_CHECKS = [
  "oa_shape",
  "office_assignments_end_reason_check",
  "office_assignments_pr_slot_check",
  "volunteers_batch_year_check",
  "volunteers_city_state_check",
  "volunteers_hostel_check",
  "volunteers_name_check",
  "volunteers_notes_check",
  "volunteers_phone_check",
  "volunteers_roll_number_check",
];

describe("committed migration and manual security SQL", () => {
  let scratch: ScratchDatabase;

  beforeAll(async () => {
    scratch = await createScratchDatabase("migration", { migrate: false });
  });

  afterAll(async () => {
    await scratch.cleanup();
  });

  it("applies to a clean database and records both migrations", async () => {
    const before = await scratch.admin<{ tablename: string }[]>`
      select tablename from pg_tables where schemaname = 'public'
    `;
    expect(before).toEqual([]);

    await runMigrations(scratch.adminUrl);

    const tables = await scratch.admin<{ tablename: string }[]>`
      select tablename from pg_tables where schemaname = 'public' order by tablename
    `;
    expect(tables.map((row) => row.tablename)).toEqual(EXPECTED_TABLES);

    const ledger = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from drizzle.__drizzle_migrations
    `;
    expect(ledger[0]?.count).toBe(2);
  });

  it("creates the four SRS enums with the exact value order", async () => {
    const rows = await scratch.admin<{ typname: string; labels: string[] }[]>`
      select t.typname, array_agg(e.enumlabel order by e.enumsortorder) as labels
      from pg_type t
      join pg_enum e on e.enumtypid = t.oid
      where t.typname in ('access_status', 'blood_group', 'builder_kind', 'creative_domain', 'gender', 'tech_kind', 'user_role', 'volunteer_status')
      group by t.typname
      order by t.typname
    `;

    expect(Object.fromEntries(rows.map((row) => [row.typname, row.labels]))).toEqual(
      EXPECTED_ENUMS,
    );
  });

  it("creates twelve indexes, twenty-three constraints and the seven foreign keys", async () => {
    const indexes = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from pg_indexes where schemaname = 'public'
    `;
    expect(indexes[0]?.count).toBe(12);

    const namedIndexes = await scratch.admin<{ indexname: string }[]>`
      select indexname from pg_indexes
      where schemaname = 'public' and indexname like '%_idx'
      order by indexname
    `;
    expect(namedIndexes.map((row) => row.indexname)).toEqual([
      "oa_roll_active_idx",
      "volunteer_domains_domain_idx",
      "volunteers_project_status_idx",
      "volunteers_status_idx",
    ]);

    const constraints = await scratch.admin<{ contype: string; count: number }[]>`
      select contype, count(*)::int as count
      from pg_constraint
      where connamespace = 'public'::regnamespace
      group by contype
      order by contype
    `;
    expect(constraints).toEqual([
      { contype: "c", count: 10 },
      { contype: "f", count: 7 },
      { contype: "p", count: 4 },
      { contype: "u", count: 2 },
    ]);

    const checks = await scratch.admin<{ conname: string }[]>`
      select conname from pg_constraint
      where connamespace = 'public'::regnamespace and contype = 'c'
      order by conname
    `;
    expect(checks.map((row) => row.conname)).toEqual(EXPECTED_CHECKS);

    const foreignKeys = await scratch.admin<
      { conname: string; confdeltype: string }[]
    >`
      select conname, confdeltype from pg_constraint
      where connamespace = 'public'::regnamespace and contype = 'f'
      order by conname
    `;
    expect(foreignKeys).toEqual([
      {
        conname: "office_assignments_ended_by_volunteers_roll_number_fk",
        confdeltype: "r",
      },
      {
        conname: "office_assignments_granted_by_volunteers_roll_number_fk",
        confdeltype: "r",
      },
      {
        conname: "office_assignments_project_id_projects_id_fk",
        confdeltype: "r",
      },
      {
        conname: "office_assignments_roll_number_volunteers_roll_number_fk",
        confdeltype: "r",
      },
      {
        conname: "volunteer_domains_roll_number_volunteers_roll_number_fk",
        confdeltype: "r",
      },
      {
        conname: "volunteers_notes_updated_by_volunteers_roll_number_fk",
        confdeltype: "r",
      },
      {
        conname: "volunteers_project_id_projects_id_fk",
        confdeltype: "r",
      },
    ]);
  });

  it("keeps the reviewed fillfactor on volunteers", async () => {
    const rows = await scratch.admin<{ reloptions: string[] | null }[]>`
      select reloptions from pg_class where oid = 'public.volunteers'::regclass
    `;
    expect(rows[0]?.reloptions).toEqual(["fillfactor=85"]);
  });

  it("is a no-op when the migration runs a second time", async () => {
    await runMigrations(scratch.adminUrl);

    const ledger = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from drizzle.__drizzle_migrations
    `;
    expect(ledger[0]?.count).toBe(2);
  });

  it("creates the app role, grants and RLS once, and is repeatable", async () => {
    await applyManualSql(scratch.adminUrl, "security.sql");
    await applyManualSql(scratch.adminUrl, "security.sql");

    const roles = await scratch.admin<
      {
        rolcanlogin: boolean;
        rolsuper: boolean;
        rolcreatedb: boolean;
        rolcreaterole: boolean;
        rolbypassrls: boolean;
      }[]
    >`
      select rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls
      from pg_roles where rolname = 'app_user'
    `;
    expect(roles).toEqual([
      {
        rolcanlogin: true,
        rolsuper: false,
        rolcreatedb: false,
        rolcreaterole: false,
        rolbypassrls: false,
      },
    ]);

    const privileges = await scratch.admin<
      {
        can_select: boolean;
        can_insert: boolean;
        can_update: boolean;
        can_delete: boolean;
        can_create_schema: boolean;
        anon_select: boolean;
        authenticated_select: boolean;
      }[]
    >`
      select
        has_table_privilege('app_user', 'public.volunteers', 'SELECT') as can_select,
        has_table_privilege('app_user', 'public.volunteers', 'INSERT') as can_insert,
        has_table_privilege('app_user', 'public.volunteers', 'UPDATE') as can_update,
        has_table_privilege('app_user', 'public.volunteers', 'DELETE') as can_delete,
        has_schema_privilege('app_user', 'public', 'CREATE') as can_create_schema,
        has_table_privilege('anon', 'public.volunteers', 'SELECT') as anon_select,
        has_table_privilege('authenticated', 'public.volunteers', 'SELECT') as authenticated_select
    `;
    expect(privileges[0]).toEqual({
      can_select: true,
      can_insert: true,
      can_update: true,
      can_delete: true,
      can_create_schema: false,
      anon_select: false,
      authenticated_select: false,
    });

    const rls = await scratch.admin<
      { relname: string; relrowsecurity: boolean }[]
    >`
      select relname, relrowsecurity from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'
      order by relname
    `;
    expect(rls).toEqual(
      EXPECTED_TABLES.map((table) => ({ relname: table, relrowsecurity: true })),
    );

    const policies = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from pg_policies
      where schemaname = 'public' and policyname = 'app_all'
    `;
    expect(policies[0]?.count).toBe(4);

    const roleSettings = await scratch.admin<{ rolconfig: string[] | null }[]>`
      select rolconfig from pg_roles where rolname = 'app_user'
    `;
    expect(roleSettings[0]?.rolconfig).toEqual(
      expect.arrayContaining([
        "statement_timeout=8s",
        "lock_timeout=3s",
        "idle_in_transaction_session_timeout=10s",
      ]),
    );

    const system = await scratch.admin<
      { roll_number: string; gender: string; batch_year: number; status: string }[]
    >`
      select roll_number, gender, batch_year, status from volunteers
      where roll_number = 'SYSTEM'
    `;
    expect(system).toEqual([
      {
        roll_number: "SYSTEM",
        gender: "OTHER",
        batch_year: 2000,
        status: "ARCHIVED",
      },
    ]);
  });
});
