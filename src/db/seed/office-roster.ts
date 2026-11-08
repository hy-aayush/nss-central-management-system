/**@license MIT © 2026 KIIT NSS Central Management System */

/**
 * Test roster seed for development and QA only.
 *
 * Sources:
 * - `src/db/seed/fixtures.ts` for the synthetic-fixtures rules and the
 *   SYNTHETIC_FIXTURE_MARKER convention.
 * - The SRS Section 8.2 office-assignment schema and `oa_shape` check
 *   constraint.
 *
 * This seed writes the test roster so every office role can be reached in
 * development. It is deliberately separate from the fixed project reference
 * data and the synthetic fixtures because it is a *post* seed: it requires
 * volunteer rows and the nine project rows first, and it writes to a different
 * table (`office_assignments`) than the fixtures.
 *
 * Run this only with an explicit flag (`--roster` on the seed CLI). It must
 * never run as part of the default seed, because the default seed is intended
 * for a fresh environment and this roster is environment-specific test data.
 *
 * Remove the whole roster, and the temporary dev sign-in accounts built from it
 * (`TEST_LOGIN_ACCOUNTS`), before production.
 */

import { and, eq, inArray, isNull, ne } from "drizzle-orm";

import type { Database } from "../client";
import { officeAssignments, volunteers } from "../schema";
import { OFFICE_ROSTER } from "./office-roster-data";

/** Stored in `volunteers.notes` for every roster row. */
export const ROSTER_FIXTURE_MARKER =
  "TEST_ROSTER_FIXTURE — not a real office member. Remove before production.";

export interface OfficeRosterSeedReport {
  volunteersInserted: number;
  volunteersRefreshed: number;
  assignmentsInserted: number;
  assignmentsSkipped: number;
  assignmentsEnded: number;
}

/** Read-only rollout plan: which roster volunteers already exist. */
export async function planOfficeRosterSeed(
  db: Database,
): Promise<{ present: string[]; missing: string[] }> {
  const rolls: readonly string[] = OFFICE_ROSTER.map((row) => row.rollNumber);

  const existing = await db
    .select({ rollNumber: volunteers.rollNumber })
    .from(volunteers)
    .where(inArray(volunteers.rollNumber, rolls));

  const presentSet = new Set<string>(existing.map((row) => row.rollNumber));

  return {
    present: rolls.filter((roll) => presentSet.has(roll)),
    missing: rolls.filter((roll) => !presentSet.has(roll)),
  };
}

const activeStatus = "ACTIVE" as const;

/**
 * Inserts or refreshes the test roster.
 *
 * Stage 1 — volunteers. A missing row is inserted with its project and blood
 * group (both compulsory on the table). An existing row is left alone apart
 * from `status`, which is reset to `ACTIVE` exactly as the operator's seed SQL
 * specifies, so a suspended test account does not silently stay locked out.
 * Names, projects and blood groups are never overwritten: an operator may have
 * corrected them in the UI.
 *
 * Stage 2 — posts. `oa_active_role_uq` is a partial unique index on
 * (roll_number, role) where `ends_at is null`. A person who is moving role in
 * this roster (24051698, COORDINATOR → TECH_TEAM in the operator's SQL) must not
 * keep the old active post, so any other active role for that roll number is
 * *ended* rather than deleted: the roster is history, and SRS 8.2 says a post is
 * ended, never removed. The insert then uses `onConflictDoNothing()` without a
 * target, which catches the partial unique index and makes a re-run idempotent.
 */
export async function seedOfficeRoster(
  db: Database,
): Promise<OfficeRosterSeedReport> {
  const plan = await planOfficeRosterSeed(db);
  const now = new Date();

  // -----------------------------------------------------------------------
  // Stage 1 — volunteers.
  // -----------------------------------------------------------------------
  for (const row of OFFICE_ROSTER) {
    await db
      .insert(volunteers)
      .values({
        rollNumber: row.rollNumber,
        name: row.name,
        gender: row.gender,
        batchYear: row.batchYear,
        status: activeStatus,
        projectId: row.projectId,
        bloodGroup: row.bloodGroup,
        // `join_date` keeps its `current_date` database default (SRS 8.2).
        notes: ROSTER_FIXTURE_MARKER,
      })
      .onConflictDoUpdate({
        target: volunteers.rollNumber,
        set: { status: activeStatus },
      });
  }

  // -----------------------------------------------------------------------
  // Stage 2 — posts.
  // -----------------------------------------------------------------------
  let assignmentsInserted = 0;
  let assignmentsEnded = 0;

  for (const row of OFFICE_ROSTER) {
    // End any other active role this person holds. The old post keeps its
    // history; only access ends.
    const ended = await db
      .update(officeAssignments)
      .set({
        endsAt: now,
        endedBy: row.rollNumber,
        endReason: "Test roster seed: role changed",
      })
      .where(
        and(
          eq(officeAssignments.rollNumber, row.rollNumber),
          ne(officeAssignments.role, row.role),
          isNull(officeAssignments.endsAt),
        ),
      )
      .returning({ id: officeAssignments.id });

    assignmentsEnded += ended.length;

    const inserted = await db
      .insert(officeAssignments)
      .values({
        rollNumber: row.rollNumber,
        role: row.role,
        techKind: row.techKind,
        builderKind: row.builderKind,
        projectId: row.prProjectId,
        prSlot: row.prSlot,
        domain: row.domain,
        accessStatus: activeStatus,
        startsAt: now,
        grantedBy: row.grantedBy,
      })
      .onConflictDoNothing()
      .returning({ id: officeAssignments.id });

    if (inserted.length > 0) {
      assignmentsInserted += 1;
    }
  }

  return {
    volunteersInserted: plan.missing.length,
    volunteersRefreshed: plan.present.length,
    assignmentsInserted,
    assignmentsSkipped: OFFICE_ROSTER.length - assignmentsInserted,
    assignmentsEnded,
  };
}
