/**
 * Validation for seed rows.
 *
 * SRS Appendix A.5 requires the seed to validate every row before writing and
 * to write nothing when any row is invalid. These schemas are used by the seed
 * functions, the CLI and the integration tests.
 *
 * Issues are reported as `row` + `field` + a short message only. No phone
 * number, name or other personal value is ever echoed back, which matters once
 * the staff CSV seed (Appendix A.5) is wired in.
 *
 * The authority for "who is a valid person" remains `src/config/identity.ts`
 * and the SRS 8.2 database CHECKs; this module must not invent stricter
 * business rules.
 */

import { z } from "zod";

import { ROLL_NUMBER_PATTERN } from "../../config/identity";

/** One reported problem. Never contains a field value. */
export interface SeedIssue {
  /** Stable row identity, e.g. `project[3]` or `volunteer[2]`. */
  row: string;
  /** Field path inside the row. */
  field: string;
  /** Short, value-free explanation. */
  message: string;
}

const projectSeedSchema = z.object({
  id: z.number().int().min(1).max(9),
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sdgs: z.array(z.number().int().min(1).max(17)).min(1),
  tagline: z.string().max(300),
  description: z.string().max(2000),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
});

const syntheticVolunteerSchema = z.object({
  rollNumber: z.string().regex(ROLL_NUMBER_PATTERN),
  name: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  batchYear: z.number().int().min(2000).max(2100),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]),
  projectId: z.number().int().min(1).max(9).nullable(),
  notes: z.string().max(1000),
});

const syntheticDomainSchema = z.object({
  rollNumber: z.string().regex(ROLL_NUMBER_PATTERN),
  domain: z.enum([
    "PHOTOGRAPHY",
    "VIDEO_EDITING",
    "GRAPHIC_DESIGNING",
    "CONTENT_WRITING",
  ]),
});

function toIssues(
  rows: readonly unknown[],
  schema: z.ZodType,
  rowPrefix: string,
): SeedIssue[] {
  const issues: SeedIssue[] = [];

  rows.forEach((row, index) => {
    const parsed = schema.safeParse(row);

    if (parsed.success) {
      return;
    }

    for (const issue of parsed.error.issues) {
      issues.push({
        row: `${rowPrefix}[${index}]`,
        field: issue.path.length > 0 ? issue.path.join(".") : "(row)",
        message: issue.message,
      });
    }
  });

  return issues;
}

function findDuplicates(
  values: readonly (string | number | undefined)[],
  field: string,
  rowPrefix: string,
): SeedIssue[] {
  const seen = new Set<string | number>();
  const issues: SeedIssue[] = [];

  values.forEach((value, index) => {
    if (value === undefined) {
      return;
    }
    if (seen.has(value)) {
      issues.push({
        row: `${rowPrefix}[${index}]`,
        field,
        message: "duplicate value",
      });
    }
    seen.add(value);
  });

  return issues;
}

function pluck(
  rows: readonly unknown[],
  field: string,
): readonly (string | number | undefined)[] {
  return rows.map((row) => {
    const value = (row as Record<string, unknown>)[field];
    return typeof value === "string" || typeof value === "number" ? value : undefined;
  });
}

/**
 * Validates the fixed project rows. Empty means the seed may write.
 *
 * Duplicate ids/slugs/names are rejected here as well as by PostgreSQL so the
 * operator sees every problem at once instead of one constraint error.
 */
export function findProjectSeedIssues(rows: readonly unknown[]): SeedIssue[] {
  return [
    ...toIssues(rows, projectSeedSchema, "project"),
    ...findDuplicates(pluck(rows, "id"), "id", "project"),
    ...findDuplicates(pluck(rows, "slug"), "slug", "project"),
    ...findDuplicates(pluck(rows, "name"), "name", "project"),
  ];
}

/** Validates the synthetic volunteer fixtures. */
export function findFixtureIssues(
  volunteers: readonly unknown[],
  domains: readonly unknown[],
): SeedIssue[] {
  const issues = [
    ...toIssues(volunteers, syntheticVolunteerSchema, "volunteer"),
    ...toIssues(domains, syntheticDomainSchema, "volunteerDomain"),
    ...findDuplicates(pluck(volunteers, "rollNumber"), "rollNumber", "volunteer"),
  ];

  const rolls = new Set(
    pluck(volunteers, "rollNumber").filter(
      (roll): roll is string => typeof roll === "string",
    ),
  );

  domains.forEach((row, index) => {
    const roll = (row as { rollNumber?: unknown }).rollNumber;
    if (typeof roll === "string" && !rolls.has(roll)) {
      issues.push({
        row: `volunteerDomain[${index}]`,
        field: "rollNumber",
        message: "domain row has no matching fixture volunteer",
      });
    }
  });

  const seenPairs = new Set<string>();
  domains.forEach((row, index) => {
    const { rollNumber, domain } = row as {
      rollNumber?: unknown;
      domain?: unknown;
    };
    const pair = `${String(rollNumber)}::${String(domain)}`;
    if (seenPairs.has(pair)) {
      issues.push({
        row: `volunteerDomain[${index}]`,
        field: "rollNumber/domain",
        message: "duplicate pair",
      });
    }
    seenPairs.add(pair);
  });

  return issues;
}
