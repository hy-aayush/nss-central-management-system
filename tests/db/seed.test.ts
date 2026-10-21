/**
 * Seed integration tests (SRS Appendix A.1, A.7 and rule 20).
 *
 * The seed runs through the real `Database` handle from `src/db/client.ts`
 * against a real migrated PostgreSQL database. Running the seed functions twice
 * must never duplicate a row, and reference data must match Appendix A.1
 * field by field.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ROLL_NUMBER_PATTERN } from "../../src/config/identity";
import { createDatabase, type Database } from "../../src/db/client";
import {
  SeedValidationError,
  countSyntheticFixtures,
  planProjectSeed,
  seedProjectReferenceData,
  seedSyntheticFixtures,
} from "../../src/db/seed";
import {
  SYNTHETIC_FIXTURE_MARKER,
  SYNTHETIC_ROLL_PREFIX,
  SYNTHETIC_VOLUNTEERS,
  SYNTHETIC_VOLUNTEER_DOMAINS,
} from "../../src/db/seed/fixtures";
import { SEED_PROJECTS } from "../../src/db/seed/reference-data";
import {
  findFixtureIssues,
  findProjectSeedIssues,
} from "../../src/db/seed/validation";
import {
  createScratchDatabase,
  type ScratchDatabase,
} from "./harness";

/** SRS Appendix A.1, copied independently from the seed module. */
const APPENDIX_A1_PROJECTS = [
  { id: 1, name: "Bandhutva", slug: "bandhutva", sdgs: [4, 17] },
  { id: 2, name: "Dhara", slug: "dhara", sdgs: [13, 14, 15] },
  { id: 3, name: "Nidaan", slug: "nidaan", sdgs: [3, 12] },
  { id: 4, name: "Riddhi", slug: "riddhi", sdgs: [8, 9] },
  { id: 5, name: "Sanyukt", slug: "sanyukt", sdgs: [16] },
  { id: 6, name: "Sparsh", slug: "sparsh", sdgs: [1, 2] },
  { id: 7, name: "Swet", slug: "swet", sdgs: [11] },
  { id: 8, name: "Udaan", slug: "udaan", sdgs: [5, 10] },
  { id: 9, name: "Urja", slug: "urja", sdgs: [6, 7] },
];

/** SRS Appendix A.5 roll numbers: fixtures must never collide with staff. */
const APPENDIX_A5_STAFF_ROLLS = [
  "2328051",
  "2328181",
  "23053452",
  "23052425",
  "23053133",
  "2329124",
  "2306220",
  "23051409",
  "23053436",
  "2405793",
  "24155354",
  "24157029",
  "24051698",
  "24155456",
  "24155598",
];

async function withDb<T>(
  scratch: ScratchDatabase,
  operation: (db: Database) => Promise<T>,
): Promise<T> {
  const { client, db } = createDatabase(scratch.adminUrl);

  try {
    return await operation(db);
  } finally {
    await client.end({ timeout: 5 });
  }
}

describe("fixed project reference seed", () => {
  let scratch: ScratchDatabase;

  beforeAll(async () => {
    scratch = await createScratchDatabase("seed");
  });

  afterAll(async () => {
    await scratch.cleanup();
  });

  it("plans every project as missing on an empty database", async () => {
    const plan = await withDb(scratch, (db) => planProjectSeed(db));

    expect(plan.present).toEqual([]);
    expect(plan.missing).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("writes the nine Appendix A.1 projects once", async () => {
    const report = await withDb(scratch, (db) => seedProjectReferenceData(db));

    expect(report).toEqual({
      inserted: 9,
      skipped: 0,
      total: 9,
      drift: [],
    });
  });

  it("stores exactly the Appendix A.1 rows and no invented copy", async () => {
    const rows = await scratch.admin<
      {
        id: number;
        name: string;
        slug: string;
        sdgs: number[];
        tagline: string;
        description: string;
        accent_color: string;
        last_activity_at: Date | null;
      }[]
    >`
      select id, name, slug, sdgs, tagline, description, accent_color, last_activity_at
      from projects order by id
    `;

    expect(rows.map(({ id, name, slug, sdgs }) => ({ id, name, slug, sdgs }))).toEqual(
      APPENDIX_A1_PROJECTS,
    );

    for (const row of rows) {
      expect(row.tagline).toBe("");
      expect(row.description).toBe("");
      expect(row.accent_color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(row.last_activity_at).toBeNull();
    }
  });

  it("is idempotent: a second run inserts nothing and duplicates nothing", async () => {
    const second = await withDb(scratch, (db) => seedProjectReferenceData(db));

    expect(second.inserted).toBe(0);
    expect(second.skipped).toBe(9);
    expect(second.drift).toEqual([]);

    const [count] = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from projects
    `;
    expect(count?.count).toBe(9);
  });

  it("does not overwrite a tagline the team edited in the UI", async () => {
    await scratch.admin`
      update projects set tagline = 'Elderly companionship'
      where id = 1
    `;

    const report = await withDb(scratch, (db) => seedProjectReferenceData(db));
    expect(report.inserted).toBe(0);
    expect(report.drift).toEqual([]);

    const [row] = await scratch.admin<{ tagline: string }[]>`
      select tagline from projects where id = 1
    `;
    expect(row?.tagline).toBe("Elderly companionship");
  });

  it("reports drift on a fixed field without overwriting or duplicating the row", async () => {
    await scratch.admin`update projects set name = 'Renamed Project' where id = 1`;

    try {
      const report = await withDb(scratch, (db) => seedProjectReferenceData(db));

      expect(report.drift).toEqual([
        {
          id: 1,
          field: "name",
          expected: "Bandhutva",
          actual: "Renamed Project",
        },
      ]);
      expect(report.inserted).toBe(0);

      const [row] = await scratch.admin<{ name: string }[]>`
        select name from projects where id = 1
      `;
      expect(row?.name).toBe("Renamed Project");

      const [count] = await scratch.admin<{ count: number }[]>`
        select count(*)::int as count from projects
      `;
      expect(count?.count).toBe(9);
    } finally {
      await scratch.admin`update projects set name = 'Bandhutva' where id = 1`;
    }
  });

  it("writes no volunteer rows: fixtures are opt-in", async () => {
    const [count] = await scratch.admin<{ count: number }[]>`
      select count(*)::int as count from volunteers
    `;
    expect(count?.count).toBe(0);

    const plan = await withDb(scratch, (db) => countSyntheticFixtures(db));
    expect(plan).toEqual({ volunteers: 0, domains: 0 });
  });
});

describe("optional synthetic fixtures", () => {
  let scratch: ScratchDatabase;

  beforeAll(async () => {
    scratch = await createScratchDatabase("fixtures");
  });

  afterAll(async () => {
    await scratch.cleanup();
  });

  it("refuses to run before the fixed projects exist", async () => {
    await expect(
      withDb(scratch, (db) => seedSyntheticFixtures(db)),
    ).rejects.toThrow(/project reference data first/);
  });

  it("inserts clearly synthetic volunteers and domains", async () => {
    await withDb(scratch, (db) => seedProjectReferenceData(db));
    const report = await withDb(scratch, (db) => seedSyntheticFixtures(db));

    expect(report).toEqual({
      volunteersInserted: SYNTHETIC_VOLUNTEERS.length,
      volunteersSkipped: 0,
      domainsInserted: SYNTHETIC_VOLUNTEER_DOMAINS.length,
      domainsSkipped: 0,
    });

    const rows = await scratch.admin<
      {
        roll_number: string;
        name: string;
        notes: string | null;
        phone: string | null;
        hostel: string | null;
        blood_group: string | null;
        city_state: string | null;
        status: string;
      }[]
    >`
      select roll_number, name, notes, phone, hostel, blood_group, city_state, status
      from volunteers order by roll_number
    `;

    expect(rows).toHaveLength(SYNTHETIC_VOLUNTEERS.length);

    for (const row of rows) {
      expect(row.roll_number.startsWith(SYNTHETIC_ROLL_PREFIX)).toBe(true);
      expect(ROLL_NUMBER_PATTERN.test(row.roll_number)).toBe(true);
      expect(row.name.startsWith("Synthetic")).toBe(true);
      expect(row.notes).toContain(SYNTHETIC_FIXTURE_MARKER);

      // No invented contact or personal details at all.
      expect(row.phone).toBeNull();
      expect(row.hostel).toBeNull();
      expect(row.blood_group).toBeNull();
      expect(row.city_state).toBeNull();
    }

    const statuses = rows.map((row) => row.status);
    expect(statuses).toContain("ACTIVE");
    expect(statuses).toContain("SUSPENDED");
  });

  it("is idempotent: a second run inserts no duplicate fixtures", async () => {
    const second = await withDb(scratch, (db) => seedSyntheticFixtures(db));

    expect(second).toEqual({
      volunteersInserted: 0,
      volunteersSkipped: SYNTHETIC_VOLUNTEERS.length,
      domainsInserted: 0,
      domainsSkipped: SYNTHETIC_VOLUNTEER_DOMAINS.length,
    });

    const counts = await withDb(scratch, (db) => countSyntheticFixtures(db));
    expect(counts.volunteers).toBe(SYNTHETIC_VOLUNTEERS.length);
    expect(counts.domains).toBe(SYNTHETIC_VOLUNTEER_DOMAINS.length);
  });

  it("never reuses an Appendix A.5 staff roll number or a real email", () => {
    for (const fixture of SYNTHETIC_VOLUNTEERS) {
      expect(APPENDIX_A5_STAFF_ROLLS).not.toContain(fixture.rollNumber);
      expect(fixture.name).toMatch(/^Synthetic Volunteer \d{2}$/);
    }

    const serialized = JSON.stringify({
      SYNTHETIC_VOLUNTEERS,
      SYNTHETIC_VOLUNTEER_DOMAINS,
    });
    expect(serialized).not.toContain("@");
  });
});

describe("seed row validation", () => {
  it("accepts the committed reference data and fixtures", () => {
    expect(findProjectSeedIssues(SEED_PROJECTS)).toEqual([]);
    expect(
      findFixtureIssues(SYNTHETIC_VOLUNTEERS, SYNTHETIC_VOLUNTEER_DOMAINS),
    ).toEqual([]);
  });

  it("reports a blank project name and duplicate ids without echoing values", () => {
    const issues = findProjectSeedIssues([
      { ...SEED_PROJECTS[0], name: "" },
      SEED_PROJECTS[0],
    ]);

    expect(issues.some((issue) => issue.field === "name")).toBe(true);
    expect(issues.some((issue) => issue.field === "id")).toBe(true);

    for (const issue of issues) {
      expect(issue.row).toMatch(/^project\[\d+\]$/);
      expect(issue.message.length).toBeGreaterThan(0);
    }
  });

  it("rejects an invalid fixture gender and an orphan domain row", () => {
    const issues = findFixtureIssues(
      [{ ...SYNTHETIC_VOLUNTEERS[0], gender: "UNKNOWN" }],
      [{ rollNumber: "9999999", domain: "PHOTOGRAPHY" }],
    );

    expect(issues.some((issue) => issue.field === "gender")).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.row === "volunteerDomain[0]" &&
          issue.message.includes("no matching fixture volunteer"),
      ),
    ).toBe(true);
  });

  it("throws before writing when reference data is invalid", () => {
    const error = new SeedValidationError("invalid", [
      { row: "project[0]", field: "name", message: "Too small" },
    ]);

    expect(error.issues).toHaveLength(1);
    expect(error.message).toBe("invalid");
  });
});
