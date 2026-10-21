/**
 * Office access gate — real PostgreSQL, real rows, no mocks.
 *
 * SRS 4.4: a person enters only when the volunteer is ACTIVE and holds at
 * least one active office assignment (`ends_at is null` and
 * `access_status = 'ACTIVE'`). Suspension, revocation, a missing volunteer and
 * a missing post all deny.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDatabase, type Database } from "../../src/db/client";
import { seedProjectReferenceData } from "../../src/db/seed";
import { resolveOfficeAccess } from "../../src/lib/auth/gate";
import {
  createScratchDatabase,
  insertAssignment,
  insertVolunteer,
  type ScratchDatabase,
} from "../db/harness";

function identity(rollNumber: string) {
  return { email: `${rollNumber}@kiit.ac.in`, rollNumber };
}

describe("database-backed office access gate", () => {
  let scratch: ScratchDatabase;
  let db: Database;
  let closeClient: () => Promise<void>;

  beforeAll(async () => {
    scratch = await createScratchDatabase("gate");

    const { client, db: handle } = createDatabase(scratch.adminUrl);
    db = handle;
    closeClient = () => client.end({ timeout: 5 });

    await seedProjectReferenceData(db);
  });

  afterAll(async () => {
    await closeClient();
    await scratch.cleanup();
  });

  it("grants access to an ACTIVE volunteer with an active post", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800801",
      name: "Gate Test Coordinator",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800801",
      role: "COORDINATOR",
    });

    const result = await resolveOfficeAccess(identity("8800801"), db);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.access.volunteer).toEqual({
      rollNumber: "8800801",
      name: "Gate Test Coordinator",
      status: "ACTIVE",
    });
    expect(result.access.identity.email).toBe("8800801@kiit.ac.in");
    expect(result.access.assignments).toHaveLength(1);
    expect(result.access.assignments[0]).toMatchObject({
      role: "COORDINATOR",
      techKind: null,
      builderKind: null,
      projectId: null,
    });
  });

  it("returns every active post, not just the first", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800807",
      name: "Gate Test Multi Post",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800807",
      role: "TECH_TEAM",
      techKind: "MEMBER",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800807",
      role: "BUILDER",
      builderKind: "POC",
    });

    const result = await resolveOfficeAccess(identity("8800807"), db);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.access.assignments.map((post) => post.role).sort()).toEqual([
      "BUILDER",
      "TECH_TEAM",
    ]);
  });

  it("denies an account with no office assignment", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800802",
      name: "Gate Test No Post",
    });

    const result = await resolveOfficeAccess(identity("8800802"), db);

    expect(result).toEqual({ ok: false, reason: "NO_ACTIVE_ASSIGNMENT" });
  });

  it("denies a suspended assignment even though the row is not ended", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800803",
      name: "Gate Test Suspended Post",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800803",
      role: "COORDINATOR",
      accessStatus: "SUSPENDED",
    });

    const result = await resolveOfficeAccess(identity("8800803"), db);

    expect(result).toEqual({ ok: false, reason: "NO_ACTIVE_ASSIGNMENT" });
  });

  it("denies a revoked assignment (ended row)", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800804",
      name: "Gate Test Ended Post",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800804",
      role: "COORDINATOR",
      endsAt: new Date(),
      endReason: "role rotation",
    });

    const result = await resolveOfficeAccess(identity("8800804"), db);

    expect(result).toEqual({ ok: false, reason: "NO_ACTIVE_ASSIGNMENT" });
  });

  it("denies a suspended volunteer who still has an active post", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800805",
      name: "Gate Test Suspended Volunteer",
      status: "SUSPENDED",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800805",
      role: "COORDINATOR",
    });

    const result = await resolveOfficeAccess(identity("8800805"), db);

    expect(result).toEqual({ ok: false, reason: "VOLUNTEER_NOT_ACTIVE" });
  });

  it("denies an archived volunteer", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800806",
      name: "Gate Test Archived",
      status: "ARCHIVED",
    });

    const result = await resolveOfficeAccess(identity("8800806"), db);

    expect(result).toEqual({ ok: false, reason: "VOLUNTEER_NOT_ACTIVE" });
  });

  it("denies an identity with no volunteer row", async () => {
    const result = await resolveOfficeAccess(identity("8899999"), db);

    expect(result).toEqual({ ok: false, reason: "VOLUNTEER_NOT_FOUND" });
  });

  it("matches on the verified roll number, not on any supplied email", async () => {
    await insertVolunteer(scratch.admin, {
      rollNumber: "8800808",
      name: "Gate Test Roll Match",
    });
    await insertAssignment(scratch.admin, {
      rollNumber: "8800808",
      role: "COORDINATOR",
    });

    const result = await resolveOfficeAccess(
      { email: "someone-else@kiit.ac.in", rollNumber: "8800809" },
      db,
    );

    expect(result).toEqual({ ok: false, reason: "VOLUNTEER_NOT_FOUND" });
  });
});
