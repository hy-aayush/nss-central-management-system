/**
 * Idempotent seed operations.
 *
 * Two separate concerns, deliberately kept apart:
 * - `seedProjectReferenceData` writes the fixed SRS Appendix A.1 rows. Every
 *   environment needs them.
 * - `seedSyntheticFixtures` writes optional fake volunteers/domains for
 *   development and tests. It only runs when explicitly requested.
 *
 * Both are idempotent: inserts use `on conflict do nothing`, so running them
 * twice never duplicates a row and never overwrites data a person edited in the
 * UI. Existing rows are reported, not updated (SRS Appendix A.5).
 *
 * Seed functions take a `Database` handle so the CLI can use the admin
 * connection and tests can use a scratch database, without importing the
 * server-only `src/db/index.ts` module.
 */

import { count, inArray } from "drizzle-orm";

import type { Database } from "../client";
import { projects, volunteerDomains, volunteers } from "../schema";
import {
  EXPECTED_PROJECT_COUNT,
  SEED_PROJECTS,
  type SeedProject,
} from "./reference-data";
import {
  SYNTHETIC_ROLL_PREFIX,
  SYNTHETIC_VOLUNTEER_DOMAINS,
  SYNTHETIC_VOLUNTEERS,
} from "./fixtures";
import { findFixtureIssues, findProjectSeedIssues, type SeedIssue } from "./validation";

/** Thrown before any write when seed data fails validation. */
export class SeedValidationError extends Error {
  readonly issues: SeedIssue[];

  constructor(message: string, issues: SeedIssue[]) {
    super(message);
    this.name = "SeedValidationError";
    this.issues = issues;
  }
}

/** A fixed field whose stored value no longer matches Appendix A.1. */
export interface ProjectDrift {
  id: number;
  field: "name" | "slug" | "sdgs";
  expected: string;
  actual: string;
}

export interface ProjectSeedReport {
  inserted: number;
  /** Rows that already existed; they were left untouched. */
  skipped: number;
  /** Row count for the nine fixed ids after the operation. */
  total: number;
  drift: ProjectDrift[];
}

export interface ProjectSeedPlan {
  present: number[];
  missing: number[];
}

export interface FixtureSeedReport {
  volunteersInserted: number;
  volunteersSkipped: number;
  domainsInserted: number;
  domainsSkipped: number;
}

function toProjectRow(project: SeedProject) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    sdgs: [...project.sdgs],
    tagline: project.tagline,
    description: project.description,
    accentColor: project.accentColor,
  };
}

function formatSdgs(sdgs: readonly number[]): string {
  return [...sdgs].sort((a, b) => a - b).join(",");
}

/**
 * Compares stored fixed fields with Appendix A.1.
 *
 * Tagline, description and accent colour are excluded: the team edits them in
 * the UI and the seed must not call those edits drift.
 */
function findDrift(
  stored: readonly {
    id: number;
    name: string;
    slug: string;
    sdgs: number[];
  }[],
): ProjectDrift[] {
  const byId = new Map(stored.map((row) => [row.id, row]));
  const drift: ProjectDrift[] = [];

  for (const expected of SEED_PROJECTS) {
    const row = byId.get(expected.id);
    if (!row) {
      continue;
    }

    if (row.name !== expected.name) {
      drift.push({ id: expected.id, field: "name", expected: expected.name, actual: row.name });
    }
    if (row.slug !== expected.slug) {
      drift.push({ id: expected.id, field: "slug", expected: expected.slug, actual: row.slug });
    }
    if (formatSdgs(row.sdgs) !== formatSdgs(expected.sdgs)) {
      drift.push({
        id: expected.id,
        field: "sdgs",
        expected: formatSdgs(expected.sdgs),
        actual: formatSdgs(row.sdgs),
      });
    }
  }

  return drift;
}

/**
 * Inserts the nine fixed projects if they are missing and reports drift.
 *
 * Safe to call repeatedly. It never updates or deletes a row.
 */
export async function seedProjectReferenceData(
  db: Database,
): Promise<ProjectSeedReport> {
  const issues = findProjectSeedIssues(SEED_PROJECTS);
  if (issues.length > 0) {
    throw new SeedValidationError(
      "Project reference data failed validation; nothing was written.",
      issues,
    );
  }

  const inserted = await db
    .insert(projects)
    .values(SEED_PROJECTS.map(toProjectRow))
    .onConflictDoNothing({ target: projects.id })
    .returning({ id: projects.id });

  const stored = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      sdgs: projects.sdgs,
    })
    .from(projects)
    .where(inArray(projects.id, SEED_PROJECTS.map((project) => project.id)));

  return {
    inserted: inserted.length,
    skipped: SEED_PROJECTS.length - inserted.length,
    total: stored.length,
    drift: findDrift(stored),
  };
}

/** Read-only plan used by the CLI dry run. */
export async function planProjectSeed(db: Database): Promise<ProjectSeedPlan> {
  const stored = await db
    .select({ id: projects.id })
    .from(projects)
    .where(inArray(projects.id, SEED_PROJECTS.map((project) => project.id)));

  const presentIds = new Set(stored.map((row) => row.id));

  return {
    present: SEED_PROJECTS.map((project) => project.id).filter((id) => presentIds.has(id)),
    missing: SEED_PROJECTS.map((project) => project.id).filter((id) => !presentIds.has(id)),
  };
}

/**
 * Inserts the optional synthetic fixtures.
 *
 * Requires the fixed projects to exist because every fixture row points at a
 * project id (or NULL). Running twice inserts nothing new. Never deletes and
 * never updates an existing roll number.
 */
export async function seedSyntheticFixtures(
  db: Database,
): Promise<FixtureSeedReport> {
  const issues = findFixtureIssues(
    SYNTHETIC_VOLUNTEERS,
    SYNTHETIC_VOLUNTEER_DOMAINS,
  );
  if (issues.length > 0) {
    throw new SeedValidationError(
      "Synthetic fixtures failed validation; nothing was written.",
      issues,
    );
  }

  const referencedProjectIds = [
    ...new Set(
      SYNTHETIC_VOLUNTEERS.flatMap((fixture) =>
        fixture.projectId === null ? [] : [fixture.projectId],
      ),
    ),
  ];
  const storedProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(inArray(projects.id, referencedProjectIds));
  const storedProjectIds = new Set(storedProjects.map((row) => row.id));
  const missingProjectIds = referencedProjectIds.filter(
    (id) => !storedProjectIds.has(id),
  );

  if (missingProjectIds.length > 0) {
    throw new Error(
      `Synthetic fixtures need the fixed project reference data first (missing project ids: ${missingProjectIds.join(", ")}). Run the seed without --fixtures (npm run db:seed -- --apply), then run it again with --fixtures.`,
    );
  }

  const insertedVolunteers = await db
    .insert(volunteers)
    .values(
      SYNTHETIC_VOLUNTEERS.map((fixture) => ({
        rollNumber: fixture.rollNumber,
        name: fixture.name,
        gender: fixture.gender,
        batchYear: fixture.batchYear,
        status: fixture.status,
        projectId: fixture.projectId,
        notes: fixture.notes,
      })),
    )
    .onConflictDoNothing({ target: volunteers.rollNumber })
    .returning({ rollNumber: volunteers.rollNumber });

  const insertedDomains = await db
    .insert(volunteerDomains)
    .values(
      SYNTHETIC_VOLUNTEER_DOMAINS.map((fixture) => ({
        rollNumber: fixture.rollNumber,
        domain: fixture.domain,
      })),
    )
    .onConflictDoNothing({
      target: [volunteerDomains.rollNumber, volunteerDomains.domain],
    })
    .returning({ rollNumber: volunteerDomains.rollNumber });

  return {
    volunteersInserted: insertedVolunteers.length,
    volunteersSkipped: SYNTHETIC_VOLUNTEERS.length - insertedVolunteers.length,
    domainsInserted: insertedDomains.length,
    domainsSkipped:
      SYNTHETIC_VOLUNTEER_DOMAINS.length - insertedDomains.length,
  };
}

/** Read-only fixture counts used by the CLI dry run. */
export async function countSyntheticFixtures(
  db: Database,
): Promise<{ volunteers: number; domains: number }> {
  const rolls = SYNTHETIC_VOLUNTEERS.map((fixture) => fixture.rollNumber);

  const [volunteerRows] = await db
    .select({ value: count() })
    .from(volunteers)
    .where(inArray(volunteers.rollNumber, [...rolls]));

  const [domainRows] = await db
    .select({ value: count() })
    .from(volunteerDomains)
    .where(
      inArray(
        volunteerDomains.rollNumber,
        SYNTHETIC_VOLUNTEER_DOMAINS.map((fixture) => fixture.rollNumber),
      ),
    );

  return {
    volunteers: Number(volunteerRows?.value ?? 0),
    domains: Number(domainRows?.value ?? 0),
  };
}

export { EXPECTED_PROJECT_COUNT, SEED_PROJECTS, SYNTHETIC_ROLL_PREFIX };
