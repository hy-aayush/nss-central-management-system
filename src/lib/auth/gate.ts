import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { officeAssignments, volunteers } from "@/db/schema";

import type { VerifiedIdentity } from "./claims";

/**
 * Database-backed office access (SRS 4.4 steps 3 and 4).
 *
 * One indexed query joins the volunteer to their *active* assignments:
 * `ends_at is null` and `access_status = 'ACTIVE'`. This is checked on every
 * request and never cached across requests (React.cache dedupes within one
 * request only).
 *
 * This module deliberately takes a `Database` handle. It has no side effects,
 * no environment access and no `server-only` import, so the integration tests
 * can run it against a real scratch PostgreSQL database with real rows.
 */

export interface ActiveAssignment {
  id: number;
  role: "COORDINATOR" | "TECH_TEAM" | "BUILDER" | "PROJECT_REPRESENTATIVE";
  techKind: "MEMBER" | "MENTOR" | null;
  builderKind: "GENERAL" | "POC" | "DOMAIN_LEAD" | null;
  projectId: number | null;
  prSlot: number | null;
  domain:
    | "PHOTOGRAPHY"
    | "VIDEO_EDITING"
    | "GRAPHIC_DESIGNING"
    | "CONTENT_WRITING"
    | null;
  startsAt: Date;
}

export interface OfficeAccess {
  identity: VerifiedIdentity;
  volunteer: {
    rollNumber: string;
    name: string;
    status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  };
  /** At least one; empty only in a denied result. */
  assignments: ActiveAssignment[];
}

export type AccessDenialReason =
  | "VOLUNTEER_NOT_FOUND"
  | "VOLUNTEER_NOT_ACTIVE"
  | "NO_ACTIVE_ASSIGNMENT";

export type AccessResult =
  | { ok: true; access: OfficeAccess }
  | { ok: false; reason: AccessDenialReason };

/**
 * Resolves office access for a verified identity.
 *
 * Deny by default: a missing volunteer row, a suspended/archived volunteer or
 * zero active assignments all deny. There is no fallback to JWT roles, client
 * state or a default account.
 */
export async function resolveOfficeAccess(
  identity: VerifiedIdentity,
  db: Database,
): Promise<AccessResult> {
  const rows = await db
    .select({
      rollNumber: volunteers.rollNumber,
      name: volunteers.name,
      status: volunteers.status,
      assignmentId: officeAssignments.id,
      role: officeAssignments.role,
      techKind: officeAssignments.techKind,
      builderKind: officeAssignments.builderKind,
      projectId: officeAssignments.projectId,
      prSlot: officeAssignments.prSlot,
      domain: officeAssignments.domain,
      startsAt: officeAssignments.startsAt,
    })
    .from(volunteers)
    .leftJoin(
      officeAssignments,
      and(
        eq(officeAssignments.rollNumber, volunteers.rollNumber),
        isNull(officeAssignments.endsAt),
        eq(officeAssignments.accessStatus, "ACTIVE"),
      ),
    )
    .where(eq(volunteers.rollNumber, identity.rollNumber))
    .orderBy(officeAssignments.startsAt);

  const first = rows[0];

  if (!first) {
    return { ok: false, reason: "VOLUNTEER_NOT_FOUND" };
  }

  if (first.status !== "ACTIVE") {
    return { ok: false, reason: "VOLUNTEER_NOT_ACTIVE" };
  }

  const assignments: ActiveAssignment[] = rows
    .filter(
      (
        row,
      ): row is typeof row & {
        assignmentId: number;
        role: ActiveAssignment["role"];
        startsAt: Date;
      } => row.assignmentId !== null && row.role !== null && row.startsAt !== null,
    )
    .map((row) => ({
      id: row.assignmentId,
      role: row.role,
      techKind: row.techKind,
      builderKind: row.builderKind,
      projectId: row.projectId,
      prSlot: row.prSlot,
      domain: row.domain,
      startsAt: row.startsAt,
    }));

  if (assignments.length === 0) {
    return { ok: false, reason: "NO_ACTIVE_ASSIGNMENT" };
  }

  return {
    ok: true,
    access: {
      identity,
      volunteer: {
        rollNumber: first.rollNumber,
        name: first.name,
        status: first.status,
      },
      assignments,
    },
  };
}
