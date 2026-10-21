/**
 * Optional synthetic fixtures for development and integration tests.
 *
 * SRS rule 20: development and staging use synthetic data only. Real volunteer
 * data never goes in the repo, tests, logs or screenshots.
 *
 * Every row here is deliberately fake:
 * - names start with `Synthetic` and end with a number;
 * - roll numbers come from the reserved `999xxxx` block and are *not* taken
 *   from the KIIT range used by real students (24xxxxxx / 23xxxxxx);
 * - `phone`, `hostel`, `blood_group` and `city_state` are left NULL: there is
 *   no reason to invent contact details at all;
 * - the notes column carries the marker below so a reviewer can find every
 *   fixture row with one query.
 *
 * These rows are optional. `scripts/seed.ts` writes them only with `--fixtures`
 * and the seed refuses to write them unless the fixed project reference data
 * already exists (they need a valid `project_id`).
 *
 * Do NOT import production rosters here. Do NOT reuse real staff roll numbers
 * from SRS Appendix A.5.
 */

/** Marker stored in `volunteers.notes` for every fixture row. */
export const SYNTHETIC_FIXTURE_MARKER = "SYNTHETIC TEST FIXTURE";

/** One synthetic volunteer row. Mirrors the SRS 8.2 columns used by a fixture. */
export interface SyntheticVolunteerFixture {
  readonly rollNumber: string;
  readonly name: string;
  readonly gender: "MALE" | "FEMALE" | "OTHER";
  readonly batchYear: number;
  readonly status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  readonly projectId: number | null;
  readonly notes: string;
}

const fixtureNote = `${SYNTHETIC_FIXTURE_MARKER} — not a real person. Safe to delete.`;

/**
 * Six synthetic volunteers spread over the nine projects.
 *
 * The mix is intentional so screens and tests exercise all three statuses:
 * five ACTIVE rows, one SUSPENDED row. No ARCHIVED row is seeded because
 * archived volunteers are hidden from default lists and would make the
 * fixture set confusing in manual testing.
 */
export const SYNTHETIC_VOLUNTEERS = [
  {
    rollNumber: "9990001",
    name: "Synthetic Volunteer 01",
    gender: "FEMALE",
    batchYear: 2024,
    status: "ACTIVE",
    projectId: 1,
    notes: fixtureNote,
  },
  {
    rollNumber: "9990002",
    name: "Synthetic Volunteer 02",
    gender: "MALE",
    batchYear: 2024,
    status: "ACTIVE",
    projectId: 2,
    notes: fixtureNote,
  },
  {
    rollNumber: "9990003",
    name: "Synthetic Volunteer 03",
    gender: "OTHER",
    batchYear: 2024,
    status: "ACTIVE",
    projectId: 3,
    notes: fixtureNote,
  },
  {
    rollNumber: "9990004",
    name: "Synthetic Volunteer 04",
    gender: "FEMALE",
    batchYear: 2025,
    status: "ACTIVE",
    projectId: 4,
    notes: fixtureNote,
  },
  {
    rollNumber: "9990005",
    name: "Synthetic Volunteer 05",
    gender: "MALE",
    batchYear: 2025,
    status: "ACTIVE",
    projectId: 5,
    notes: fixtureNote,
  },
  {
    rollNumber: "9990006",
    name: "Synthetic Volunteer 06",
    gender: "FEMALE",
    batchYear: 2025,
    status: "SUSPENDED",
    projectId: null,
    notes: fixtureNote,
  },
] as const satisfies readonly SyntheticVolunteerFixture[];

/** Optional synthetic creative-domain rows; at most one row per pair. */
export const SYNTHETIC_VOLUNTEER_DOMAINS = [
  { rollNumber: "9990001", domain: "PHOTOGRAPHY" },
  { rollNumber: "9990002", domain: "VIDEO_EDITING" },
  { rollNumber: "9990003", domain: "GRAPHIC_DESIGNING" },
  { rollNumber: "9990004", domain: "CONTENT_WRITING" },
  { rollNumber: "9990004", domain: "PHOTOGRAPHY" },
] as const;

/**
 * Every fixture roll number starts with this prefix. Tests and manual cleanup
 * use it to find and remove fixture rows without touching real data.
 */
export const SYNTHETIC_ROLL_PREFIX = "999";
