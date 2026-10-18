/**
 * Authentication, staff membership, and authorization types for NSS Central Management System.
 * Matches docs/SRS.md Sections 2.1, 4, 5, 10.1 and docs/PERMISSIONS.md.
 */

import type { CreativeDomain, ProjectId } from "./project";
import type { VolunteerBasic, VolunteerDetail, VolunteerSummary } from "./volunteer";

export type UserRole = "COORDINATOR" | "TECH_TEAM" | "BUILDER" | "PROJECT_REPRESENTATIVE";
export type TechKind = "MEMBER" | "MENTOR";
export type BuilderKind = "GENERAL" | "POC" | "DOMAIN_LEAD";
export type AccessStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";

/** Rank. Used for display, "who may act on whom" and audit actor_role. NOT used to pick permissions. */
export type PostKind = "COORDINATOR" | "MENTOR" | "MEMBER" | "PR" | "POC" | "BUILDER";
export const POST_TIER: Record<PostKind, number> = {
  COORDINATOR: 5,
  MENTOR: 4,
  MEMBER: 3,
  PR: 2,
  POC: 2,
  BUILDER: 1,
};

export interface OfficeAssignment {      // = one row of office_assignments (roster + role history)
  id: number;
  rollNumber: string;
  role: UserRole;
  techKind: TechKind | null;             // only for TECH_TEAM
  builderKind: BuilderKind | null;       // only for BUILDER
  projectId: ProjectId | null;           // only for PROJECT_REPRESENTATIVE
  prSlot: 1 | 2 | null;                  // only for PROJECT_REPRESENTATIVE
  domain: CreativeDomain | null;         // only for DOMAIN_LEAD
  accessStatus: AccessStatus;
  startsAt: string;
  endsAt: string | null;
  grantedBy: string;
  endedBy: string | null;
  endReason: string | null;
}

export type RosterEntry = OfficeAssignment & {
  volunteer: VolunteerBasic;
  email?: string;
  status?: AccessStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  projectScope?: string[];
};

export type EmergencyPack =
  | "PROJECT_VIEW_BASIC"
  | "PROJECT_EDIT_BASIC"
  | "EVENT_FCFS"
  | "EVENT_ATTENDANCE"
  | "MEETING_RUN";

export interface EmergencyScope {        // one active grant, as the resolver sees it
  grantId: number;
  pack: EmergencyPack;
  projectId: ProjectId | null;
  eventId: number | null;
  meetingId: number | null;
  expiresAt: string;
}

/** The ONLY thing authorization code looks at. Built on the server, per request, from the DB. */
export interface ActorContext {
  rollNumber: string;
  name: string;
  primaryRole: UserRole | null;          // highest post. null = emergency-only user
  tier: number;                          // POST_TIER of the highest post; 0 for emergency-only users
  roles: UserRole[];                     // all active roles
  techKind: TechKind | null;             // MENTOR beats MEMBER; null if not Tech
  builderKind: BuilderKind | null;       // highest active kind; null if not a builder
  projectScope: ProjectId[];             // PR projects; [] for everyone else
  permissions: PermissionAction[];       // UNION over all active posts (Section 4.3)
  emergency: EmergencyScope[];           // active scoped packs. Never merged into permissions
  correlationId: string;                 // uuid for this request, goes into audit and logs
}

/** Display shape for team pages. Never used for authorization. */
export interface StaffMember {
  details: VolunteerSummary | VolunteerDetail;
  role: UserRole;
  techKind: TechKind | null;
  builderKind: BuilderKind | null;
  status: AccessStatus;
  createdAt: string;
  lastActiveAt?: string;
}

// Backward-compatibility aliases
export type OfficeRole = UserRole;
export type OfficeUser = StaffMember;
export type User = StaffMember;
export type UserStatus = AccessStatus;

export type PermissionAction =
  // viewing
  | "view:dashboard:organization"
  | "view:dashboard:project"
  | "view:volunteers:all"
  | "view:volunteers:project"
  | "view:event:central:assigned_volunteers"
  | "view:event:project:assigned_volunteers"
  | "view:events:scheduled_and_ongoing:all"
  | "view:events:past:all"
  | "view:events:past:central"
  | "view:events:past:project"
  | "view:analytics:cross_project"
  | "view:analytics:project"
  | "view:audit_logs"
  // volunteers
  | "create:volunteer"
  | "import:volunteers"
  | "import:history"
  | "edit:volunteer:details"
  | "edit:volunteer:affiliations"
  | "edit:volunteer:notes"
  | "flag:volunteer"
  | "revoke:red_flag"
  | "suspend:volunteer"
  | "reinstate:volunteer"
  | "archive:volunteer"
  | "delete:volunteer"
  | "request:volunteer_action"
  | "decide:request"
  // events
  | "create:event:central"
  | "create:event:project"
  | "edit:event"
  | "edit:event:after_fcfs_open"
  | "approve:event:collaboration"
  | "force:event:collaboration"
  | "manage:event:fcfs"
  | "edit:event:fcfs"
  | "manage:event:attendance"
  | "lock:event"
  | "correct:attendance"
  | "manage:event_groups"
  | "manage:event_categories"
  | "archive:year"
  // meetings
  | "create:meeting:project"
  | "create:meeting:central"
  | "create:meeting:builders"
  | "manage:meeting"
  | "manage:meeting:attendance"
  | "lock:meeting"
  // access, hours, export, system
  | "manage:roster"
  | "approve:hours"
  | "adjust:hours"
  | "manage:hours_types"
  | "export:csv:bounded"
  | "manage:settings"
  | "manage:settings:system"
  | "manage:feature_flags"
  | "manage:emergency_access"
  | "run:maintenance"
  | "request:retention_run"
  | "run:retention"      // run:retention = Coordinator only
  | "override:soft_rules";

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "LOCKED"
  | "LIMIT_EXCEEDED"
  | "RATE_LIMITED"
  | "MAINTENANCE"
  | "READ_ONLY"
  | "INTERNAL";

/** Every server action returns this. Out-of-scope data -> NOT_FOUND. */
export type ActionResult<T> =
  | { ok: true; data: T; notice?: string }
  | {
      ok: false;
      error: {
        code: ErrorCode;
        message: string;                       // plain words a volunteer coordinator can read
        fieldErrors?: Record<string, string>;
        retryAfterSec?: number;                // RATE_LIMITED
        editsLeft?: number;                    // LIMIT_EXCEEDED from the edit budget
      };
    };