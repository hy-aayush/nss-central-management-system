/**@license MIT © 2026 KIIT NSS Central Management System */

/**
 * Test roster rows — development/QA data only.
 *
 * Source of truth: the operator's seed SQL (9 coordinators + 6 tech team), plus
 * one extra row per remaining office role so each login case can be exercised.
 *
 * This is fake data. Nothing here is a real office roster:
 * - the fifteen rows from the operator's SQL keep the real KIIT roll numbers and
 *   names that were supplied, so Google sign-in with the matching `@kiit.ac.in`
 *   identity still works end-to-end;
 * - the extra role rows use the reserved `9991xxx` block (see
 *   `SYNTHETIC_ROLL_PREFIX` in `./fixtures.ts`) so they can never be mistaken
 *   for a real student;
 * - every volunteer row carries `ROSTER_FIXTURE_MARKER` in `notes`, so the whole
 *   roster can be found and removed with one query before a production run.
 *
 * Role shapes follow `oa_shape` in `office-assignments.ts`:
 * - COORDINATOR: nothing but the role.
 * - TECH_TEAM: a `techKind`, nothing else.
 * - PROJECT_REPRESENTATIVE: a project and one of the two PR slots.
 * - BUILDER: a `builderKind`; only a DOMAIN_LEAD names a domain.
 *
 * `projectId` is the volunteer's own project (`volunteers.project_id`) and is
 * compulsory on every row. `prProjectId`/`prSlot` belong to the office post and
 * are only set for a project representative.
 */

/**
 * Local mirrors of the SRS 8.1 enum values. They are written out rather than
 * imported so this module stays free of the Drizzle schema at runtime; the
 * seed's insert types fail to compile if any value drifts.
 */

/** The `blood_group` enum values. */
export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type TechKind = "MEMBER" | "MENTOR";
export type BuilderKind = "GENERAL" | "POC" | "DOMAIN_LEAD";
export type CreativeDomain =
  | "PHOTOGRAPHY"
  | "VIDEO_EDITING"
  | "GRAPHIC_DESIGNING"
  | "CONTENT_WRITING";

/**
 * Temporary development sign-in cases.
 *
 * Real authentication is Google OAuth over the institutional domain and is
 * decided later. Until then the login page accepts these hardcoded credentials
 * in development so every role can be reached without fifteen Google accounts.
 * The password is per case, the username is always the row's roll number.
 *
 * Remove this table together with the roster before production.
 */
export const TEST_LOGIN_CASES = {
  coordinator: { label: "Coordinator", password: "coordinator-test" },
  "tech-3yr": { label: "Tech team — 3rd year", password: "tech3-test" },
  "tech-4yr": { label: "Tech team — 4th year", password: "tech4-test" },
  "project-representative": {
    label: "Project representative",
    password: "pr-test",
  },
  poc: { label: "POC builder", password: "poc-test" },
  builder: { label: "Builder", password: "builder-test" },
  "domain-lead": { label: "Domain lead builder", password: "lead-test" },
} as const satisfies Record<string, { label: string; password: string }>;

export type TestLoginCase = keyof typeof TEST_LOGIN_CASES;

interface RosterBase {
  readonly rollNumber: string;
  readonly name: string;
  readonly gender: Gender;
  readonly batchYear: number;
  /** `volunteers.project_id`; compulsory for every volunteer. */
  readonly projectId: number;
  readonly bloodGroup: BloodGroup;
  /** Development sign-in case; supplies the temporary password. */
  readonly loginCase: TestLoginCase;
  /** The person who granted the post (self for the bootstrap roster). */
  readonly grantedBy: string;
}

export type CoordinatorRow = RosterBase & {
  readonly role: "COORDINATOR";
  readonly techKind: null;
  readonly builderKind: null;
  readonly prProjectId: null;
  readonly prSlot: null;
  readonly domain: null;
};

export type TechTeamRow = RosterBase & {
  readonly role: "TECH_TEAM";
  readonly techKind: TechKind;
  readonly builderKind: null;
  readonly prProjectId: null;
  readonly prSlot: null;
  readonly domain: null;
};

export type ProjectRepresentativeRow = RosterBase & {
  readonly role: "PROJECT_REPRESENTATIVE";
  readonly techKind: null;
  readonly builderKind: null;
  readonly prProjectId: number;
  readonly prSlot: 1 | 2;
  readonly domain: null;
};

export type BuilderRow = RosterBase & {
  readonly role: "BUILDER";
  readonly techKind: null;
  readonly builderKind: BuilderKind;
  readonly prProjectId: null;
  readonly prSlot: null;
  readonly domain: CreativeDomain | null;
};

export type OfficeRosterRow =
  | CoordinatorRow
  | TechTeamRow
  | ProjectRepresentativeRow
  | BuilderRow;

/**
 * Fifteen rows from the operator's SQL, then one row per remaining role.
 *
 * Each entry holds exactly one active post; there are no historical ended posts
 * in this seed.
 */
export const OFFICE_ROSTER = [
  // === COORDINATORS (9 people) ===
  {
    rollNumber: "2328051",
    name: "Test Coordinator 1",
    gender: "MALE",
    batchYear: 2023,
    projectId: 1,
    bloodGroup: "A+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "2328051",
  },
  {
    rollNumber: "2328181",
    name: "Test Coordinator 2",
    gender: "MALE",
    batchYear: 2023,
    projectId: 2,
    bloodGroup: "B+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "2328181",
  },
  {
    rollNumber: "23053452",
    name: "Test Coordinator 3",
    gender: "MALE",
    batchYear: 2023,
    projectId: 3,
    bloodGroup: "O+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "23053452",
  },
  {
    rollNumber: "23052425",
    name: "Test Coordinator 4",
    gender: "MALE",
    batchYear: 2023,
    projectId: 4,
    bloodGroup: "AB+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "23052425",
  },
  {
    rollNumber: "23053133",
    name: "Test Coordinator 5",
    gender: "MALE",
    batchYear: 2023,
    projectId: 5,
    bloodGroup: "A-",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "23053133",
  },
  {
    rollNumber: "2329124",
    name: "Test Coordinator 6",
    gender: "MALE",
    batchYear: 2023,
    projectId: 6,
    bloodGroup: "B-",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "2329124",
  },
  {
    rollNumber: "2306220",
    name: "Saumyajit Sarkar",
    gender: "MALE",
    batchYear: 2023,
    projectId: 7,
    bloodGroup: "O-",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "2306220",
  },
  {
    rollNumber: "23051409",
    name: "Ankit Kumar",
    gender: "MALE",
    batchYear: 2023,
    projectId: 8,
    bloodGroup: "A+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "23051409",
  },
  {
    rollNumber: "23053436",
    name: "Piyush Agrawal",
    gender: "MALE",
    batchYear: 2023,
    projectId: 9,
    bloodGroup: "B+",
    loginCase: "coordinator",
    role: "COORDINATOR",
    techKind: null,
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "23053436",
  },

  // === TECH TEAM — 3rd year (batch 2024) ===
  {
    rollNumber: "2405793",
    name: "Anuj Sharma",
    gender: "MALE",
    batchYear: 2024,
    projectId: 1,
    bloodGroup: "O+",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "2405793",
  },
  {
    rollNumber: "24155354",
    name: "Soham Lodh",
    gender: "MALE",
    batchYear: 2024,
    projectId: 2,
    bloodGroup: "AB+",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "24155354",
  },
  {
    rollNumber: "24157029",
    name: "Pinak Dhar",
    gender: "MALE",
    batchYear: 2024,
    projectId: 3,
    bloodGroup: "A-",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "24157029",
  },
  {
    rollNumber: "24155456",
    name: "Anshu Kumar Pandey",
    gender: "MALE",
    batchYear: 2024,
    projectId: 4,
    bloodGroup: "B-",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "24155456",
  },
  {
    rollNumber: "24155598",
    name: "Aditya Sharma",
    gender: "MALE",
    batchYear: 2024,
    projectId: 5,
    bloodGroup: "O-",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "24155598",
  },
  // Moved from COORDINATOR to TECH_TEAM in the operator's SQL.
  {
    rollNumber: "24051698",
    name: "Ayush Kumar",
    gender: "MALE",
    batchYear: 2024,
    projectId: 6,
    bloodGroup: "A+",
    loginCase: "tech-3yr",
    role: "TECH_TEAM",
    techKind: "MEMBER",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "24051698",
  },

  // === TECH TEAM — 4th year (batch 2023) ===
  // Reserved 9991xxx roll: this row exists only for the temporary dev login.
  {
    rollNumber: "9991001",
    name: "Test Tech Mentor 4th Year",
    gender: "MALE",
    batchYear: 2023,
    projectId: 2,
    bloodGroup: "B+",
    loginCase: "tech-4yr",
    role: "TECH_TEAM",
    techKind: "MENTOR",
    builderKind: null,
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "9991001",
  },

  // === PROJECT REPRESENTATIVE (project 1, slot 1) ===
  {
    rollNumber: "9991002",
    name: "Test Project Representative",
    gender: "FEMALE",
    batchYear: 2024,
    projectId: 1,
    bloodGroup: "O+",
    loginCase: "project-representative",
    role: "PROJECT_REPRESENTATIVE",
    techKind: null,
    builderKind: null,
    prProjectId: 1,
    prSlot: 1,
    domain: null,
    grantedBy: "9991002",
  },

  // === BUILDERS: POC, GENERAL, DOMAIN_LEAD ===
  {
    rollNumber: "9991003",
    name: "Test POC Builder",
    gender: "MALE",
    batchYear: 2024,
    projectId: 3,
    bloodGroup: "A-",
    loginCase: "poc",
    role: "BUILDER",
    techKind: null,
    builderKind: "POC",
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "9991003",
  },
  {
    rollNumber: "9991004",
    name: "Test Builder",
    gender: "FEMALE",
    batchYear: 2025,
    projectId: 4,
    bloodGroup: "AB-",
    loginCase: "builder",
    role: "BUILDER",
    techKind: null,
    builderKind: "GENERAL",
    prProjectId: null,
    prSlot: null,
    domain: null,
    grantedBy: "9991004",
  },
  {
    rollNumber: "9991005",
    name: "Test Domain Lead Builder",
    gender: "FEMALE",
    batchYear: 2025,
    projectId: 5,
    bloodGroup: "O-",
    loginCase: "domain-lead",
    role: "BUILDER",
    techKind: null,
    builderKind: "DOMAIN_LEAD",
    prProjectId: null,
    prSlot: null,
    domain: "PHOTOGRAPHY",
    grantedBy: "9991005",
  },
] as const satisfies readonly OfficeRosterRow[];

/** One temporary dev sign-in account, derived from the roster. */
export interface TestLoginAccount {
  readonly username: string;
  readonly password: string;
  readonly rollNumber: string;
  readonly label: string;
}

/**
 * The dev sign-in list: one account per roster row, usernames are roll numbers.
 *
 * Callers must check `isDevLoginEnabled()` before accepting any of these; the
 * table exists only so a developer can reach each role locally.
 */
export const TEST_LOGIN_ACCOUNTS: readonly TestLoginAccount[] =
  OFFICE_ROSTER.map((row) => ({
    username: row.rollNumber,
    password: TEST_LOGIN_CASES[row.loginCase].password,
    rollNumber: row.rollNumber,
    label: TEST_LOGIN_CASES[row.loginCase].label,
  }));
