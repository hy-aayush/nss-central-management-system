/**
 * Fixed reference data for the NSS Central Management System.
 *
 * Source of truth: `docs/SRS.md` Appendix A.1 (projects) and Section 8.2.
 *
 * This module is deliberately pure: it imports nothing from the database
 * client, reads no environment variable and has no side effects. The seed
 * script, the integration tests and (later) the UI can all import it.
 *
 * Rules for editing this file:
 * - Project ids 1-9 are stable business identifiers used by volunteers,
 *   events, meetings and office assignments. Never renumber them.
 * - `tagline` and `description` stay empty until the NSS team supplies copy
 *   (Appendix A.1). Do not invent project descriptions here.
 * - `accentColor` is a UI choice. The SRS says it is chosen in the UI spec; the
 *   UI spec does not define project colours yet, so the values below reuse the
 *   hues already used by the prototype's `PROJECT_COLOR_MAP`
 *   (`src/lib/constants.ts`) as Tailwind-500 hex equivalents. They are seed
 *   defaults, not fixed business data, and may be changed without a migration.
 * - Only the nine Appendix A.1 fields are seed data. Anything else (counts,
 *   status, representatives) is derived at read time and must not be seeded.
 *
 * Do NOT add volunteers, office staff or personal details to this file. Those
 * belong in `fixtures.ts` (clearly synthetic test data) or the git-ignored
 * staff CSV described in SRS Appendix A.5.
 */

/** One fixed project row, exactly as Appendix A.1 defines it. */
export interface SeedProject {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly sdgs: readonly number[];
  /** Empty until the NSS team supplies copy (Appendix A.1). */
  readonly tagline: string;
  /** Empty until the NSS team supplies copy (Appendix A.1). */
  readonly description: string;
  /** UI accent colour as a `#rrggbb` string (schema default is `#64748b`). */
  readonly accentColor: string;
}

/**
 * The nine fixed projects, in Appendix A.1 order.
 *
 * Verified field-by-field against the SRS table by
 * `tests/db/seed.test.ts`; changing a name, slug or SDG list here requires the
 * same change in the SRS.
 */
export const SEED_PROJECTS = [
  {
    id: 1,
    name: "Bandhutva",
    slug: "bandhutva",
    sdgs: [4, 17],
    tagline: "",
    description: "",
    accentColor: "#10b981",
  },
  {
    id: 2,
    name: "Dhara",
    slug: "dhara",
    sdgs: [13, 14, 15],
    tagline: "",
    description: "",
    accentColor: "#14b8a6",
  },
  {
    id: 3,
    name: "Nidaan",
    slug: "nidaan",
    sdgs: [3, 12],
    tagline: "",
    description: "",
    accentColor: "#f43f5e",
  },
  {
    id: 4,
    name: "Riddhi",
    slug: "riddhi",
    sdgs: [8, 9],
    tagline: "",
    description: "",
    accentColor: "#f59e0b",
  },
  {
    id: 5,
    name: "Sanyukt",
    slug: "sanyukt",
    sdgs: [16],
    tagline: "",
    description: "",
    accentColor: "#6366f1",
  },
  {
    id: 6,
    name: "Sparsh",
    slug: "sparsh",
    sdgs: [1, 2],
    tagline: "",
    description: "",
    accentColor: "#8b5cf6",
  },
  {
    id: 7,
    name: "Swet",
    slug: "swet",
    sdgs: [11],
    tagline: "",
    description: "",
    accentColor: "#0ea5e9",
  },
  {
    id: 8,
    name: "Udaan",
    slug: "udaan",
    sdgs: [5, 10],
    tagline: "",
    description: "",
    accentColor: "#3b82f6",
  },
  {
    id: 9,
    name: "Urja",
    slug: "urja",
    sdgs: [6, 7],
    tagline: "",
    description: "",
    accentColor: "#f97316",
  },
] as const satisfies readonly SeedProject[];

/**
 * Fields that must match Appendix A.1 exactly. Tagline, description and accent
 * colour are intentionally excluded: the team edits them in the UI, and the
 * seed must not report those edits as drift.
 */
export const FIXED_PROJECT_FIELDS = ["id", "name", "slug", "sdgs"] as const;

/** Expected number of reference rows; used by the seed report and tests. */
export const EXPECTED_PROJECT_COUNT = SEED_PROJECTS.length;
