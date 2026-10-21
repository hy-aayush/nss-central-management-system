/**
 * Scratch-database harness for the PostgreSQL integration tests.
 *
 * These tests use a real PostgreSQL server, a real connection and the committed
 * migration + manual SQL files. Nothing is mocked: a constraint is considered
 * verified only when PostgreSQL itself rejects the statement.
 *
 * Requirements:
 * - `TEST_ADMIN_DATABASE_URL` points at a disposable local PostgreSQL server
 *   (see docs/DATABASE.md). Loopback hosts are required unless
 *   `ALLOW_REMOTE_TEST_DB=1` is set for an explicitly approved staging server.
 * - The role in that URL can create databases and roles (the local `postgres`
 *   superuser in the documented Docker command).
 *
 * Each test file gets its own freshly migrated database and drops it in
 * `cleanup()`, so tests never share rows and never touch a real database.
 */

import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { expect } from "vitest";

import {
  applyManualSql,
  runMigrations,
} from "../../scripts/lib/database-ops";

export type TestSql = ReturnType<typeof postgres>;

export interface ScratchDatabase {
  /** Generated database name, e.g. `nss_test_seed_lx2k9f1a`. */
  name: string;
  /** Admin connection string ordered straight from the test env URL. */
  adminUrl: string;
  /** Connection as the least-privilege `app_user`; set after `enableAppRole()`. */
  appUrl: string | null;
  /** Admin client already connected to the scratch database. */
  admin: TestSql;
  /**
   * Sets a temporary password on `app_user` and returns its connection string.
   * Only valid after `security.sql` has created the role.
   */
  enableAppRole: () => Promise<string>;
  /** Ends the admin client and drops the database (with force). */
  cleanup: () => Promise<void>;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Reads and validates the test admin URL. Throws with setup instructions. */
export function testAdminUrl(): string {
  const raw = process.env.TEST_ADMIN_DATABASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "TEST_ADMIN_DATABASE_URL is not set. Start the disposable PostgreSQL container and export the URL (see docs/DATABASE.md, 'Local test database').",
    );
  }

  const parsed = new URL(raw);

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("TEST_ADMIN_DATABASE_URL must be a postgresql:// URL.");
  }

  if (!LOCAL_HOSTS.has(parsed.hostname) && process.env.ALLOW_REMOTE_TEST_DB !== "1") {
    throw new Error(
      `Refusing to run destructive integration tests against remote host "${parsed.hostname}". Use a disposable local database, or set ALLOW_REMOTE_TEST_DB=1 for an explicitly approved staging database.`,
    );
  }

  return raw;
}

/** Opens a real postgres-js connection (max one connection, silent notices). */
export function connect(url: string): TestSql {
  return postgres(url, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    onnotice: () => {},
  });
}

let rolesPromise: Promise<void> | undefined;

/**
 * Creates the Supabase API roles that `security.sql` deliberately revokes from.
 *
 * Roles are cluster-wide, so this is memoized per worker. It is not skipped:
 * `security.sql` must fail loudly if the revoke target is missing.
 */
export function ensureClusterRoles(): Promise<void> {
  rolesPromise ??= (async () => {
    const root = connect(testAdminUrl());

    try {
      await root.unsafe(
        `do $$ begin
           if not exists (select 1 from pg_roles where rolname = 'anon') then
             create role anon nologin;
           end if;
         end $$;`,
      );
      await root.unsafe(
        `do $$ begin
           if not exists (select 1 from pg_roles where rolname = 'authenticated') then
             create role authenticated nologin;
           end if;
         end $$;`,
      );
    } finally {
      await root.end({ timeout: 5 });
    }
  })();

  return rolesPromise;
}

function scratchName(label: string): string {
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
  const suffix = `${Date.now().toString(36)}${randomUUID().slice(0, 6)}`;
  return `nss_test_${safeLabel}_${suffix}`;
}

export interface ScratchDatabaseOptions {
  /** Apply `drizzle/` migrations. Defaults to true. */
  migrate?: boolean;
  /** Apply `drizzle/manual/security.sql` and prepare the app role. Defaults to false. */
  security?: boolean;
}

/**
 * Creates a unique empty database, optionally migrates it and applies the
 * manual security SQL. The caller must always call `cleanup()`.
 */
export async function createScratchDatabase(
  label: string,
  options: ScratchDatabaseOptions = {},
): Promise<ScratchDatabase> {
  const { migrate: shouldMigrate = true, security = false } = options;

  const baseUrl = testAdminUrl();
  await ensureClusterRoles();

  const name = scratchName(label);
  const base = new URL(baseUrl);
  const root = connect(base.toString());

  try {
    await root.unsafe(`create database ${quoteIdentifier(name)}`);
  } finally {
    await root.end({ timeout: 5 });
  }

  const databaseUrl = new URL(base.toString());
  databaseUrl.pathname = `/${name}`;
  const adminUrl = databaseUrl.toString();
  const admin = connect(adminUrl);

  let appUrl: string | null = null;

  const scratch: ScratchDatabase = {
    name,
    adminUrl,
    admin,
    get appUrl() {
      return appUrl;
    },
    async enableAppRole() {
      const password = `nss_test_${randomUUID().replace(/-/g, "")}`;
      await admin.unsafe(`alter role app_user password '${password}'`);

      const url = new URL(adminUrl);
      url.username = "app_user";
      url.password = password;
      appUrl = url.toString();

      return appUrl;
    },
    async cleanup() {
      await admin.end({ timeout: 5 });

      const dropper = connect(testAdminUrl());
      try {
        await dropper.unsafe(
          `drop database if exists ${quoteIdentifier(name)} with (force)`,
        );
      } finally {
        await dropper.end({ timeout: 5 });
      }
    },
  };

  try {
    if (shouldMigrate) {
      await runMigrations(adminUrl);
    }

    if (security) {
      await applyManualSql(adminUrl, "security.sql");
      await scratch.enableAppRole();
    }
  } catch (error) {
    // Do not leak a half-prepared database when setup fails.
    await scratch.cleanup();
    throw error;
  }

  return scratch;
}

/** Raw PostgreSQL error shape used by the assertions below. */
export interface PgErrorShape {
  code?: string;
  constraint_name?: string;
  column_name?: string;
  message?: string;
}

export interface PgErrorExpectation {
  code: string;
  constraint?: string;
  column?: string;
}

/**
 * Asserts that PostgreSQL rejected the statement with the expected SQLSTATE
 * (and optionally the expected constraint or column). Fails if the statement
 * unexpectedly succeeded, so a missing constraint can never pass silently.
 */
export async function expectPgError(
  operation: Promise<unknown>,
  expected: PgErrorExpectation,
): Promise<PgErrorShape> {
  let failure: PgErrorShape | undefined;

  try {
    await operation;
  } catch (error) {
    failure = error as PgErrorShape;
  }

  if (!failure) {
    throw new Error(
      `Expected PostgreSQL error ${expected.code}${expected.constraint ? ` (${expected.constraint})` : ""}, but the statement succeeded.`,
    );
  }

  expect(failure.code).toBe(expected.code);

  if (expected.constraint) {
    expect(failure.constraint_name).toBe(expected.constraint);
  }

  if (expected.column) {
    expect(failure.column_name).toBe(expected.column);
  }

  return failure;
}

export interface VolunteerInsert {
  rollNumber: string;
  name?: string | null;
  gender?: string | null;
  batchYear?: number | null;
  projectId?: number | null;
  phone?: string | null;
  hostel?: string | null;
  bloodGroup?: string | null;
  cityState?: string | null;
  notes?: string | null;
  notesUpdatedBy?: string | null;
  status?: string | null;
}

/** Inserts one volunteer with parameter binding and returns the stored row. */
export async function insertVolunteer(
  sql: TestSql,
  values: VolunteerInsert,
): Promise<Record<string, unknown>> {
  const {
    rollNumber,
    name = "Test Person",
    gender = "MALE",
    batchYear = 2024,
    projectId = null,
    phone = null,
    hostel = null,
    bloodGroup = null,
    cityState = null,
    notes = null,
    notesUpdatedBy = null,
    status = "ACTIVE",
  } = values;

  const [row] = await sql`
    insert into volunteers (
      roll_number, name, gender, batch_year, project_id, phone, hostel,
      blood_group, city_state, notes, notes_updated_by, status
    ) values (
      ${rollNumber}, ${name}, ${gender}, ${batchYear}, ${projectId}, ${phone},
      ${hostel}, ${bloodGroup}, ${cityState}, ${notes}, ${notesUpdatedBy},
      ${status}
    )
    returning *
  `;

  return row as Record<string, unknown>;
}

/** Deletes a volunteer and its domain rows (FK is ON DELETE RESTRICT). */
export async function deleteVolunteer(sql: TestSql, rollNumber: string): Promise<void> {
  await sql`delete from volunteer_domains where roll_number = ${rollNumber}`;
  await sql`delete from volunteers where roll_number = ${rollNumber}`;
}
