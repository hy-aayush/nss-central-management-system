/**
 * Audit log entry and filter types for NSS Central Management System.
 * Matches docs/SRS.md Sections 8.6, 10.7, 13.
 */

import type { UserRole } from "./auth";
import type { ProjectName } from "./project";

export type AuditAction =
  // volunteers
  | "VOLUNTEER_CREATE"
  | "VOLUNTEER_UPDATE"
  | "VOLUNTEER_STATUS_CHANGE"
  | "VOLUNTEER_SUSPEND"
  | "VOLUNTEER_REINSTATE"
  | "VOLUNTEER_ARCHIVE"
  | "VOLUNTEER_DELETE"
  | "PROJECT_AFFILIATION_CHANGE"
  | "DOMAIN_MEMBERSHIP_CHANGE"
  | "VOLUNTEER_NOTE_UPDATE"
  | "RED_FLAG_ADD"
  | "RED_FLAG_REVOKE"
  // requests
  | "REQUEST_CREATE"
  | "REQUEST_APPROVE"
  | "REQUEST_REJECT"
  | "REQUEST_CANCEL"
  // access
  | "ROLE_GRANT"
  | "ROLE_REVOKE"
  | "STAFF_SUSPEND"
  | "LOGIN_DENIED"
  | "EMERGENCY_ACCESS_GRANT"
  | "EMERGENCY_ACCESS_REVOKE"
  // events
  | "EVENT_CREATE"
  | "EVENT_UPDATE"
  | "EVENT_PUBLISH"
  | "EVENT_RESCHEDULE"
  | "EVENT_CANCEL"
  | "EVENT_COLLAB_APPROVE"
  | "EVENT_COLLAB_REJECT"
  | "EVENT_COLLAB_FORCE"
  | "EVENT_LOCK"
  | "EVENT_UNLOCK"
  | "EVENT_FINALIZE"
  | "EVENT_ARCHIVE"
  | "FCFS_ENTRY"
  | "FCFS_EDIT"
  | "FCFS_REMOVE"
  | "EDIT_BUDGET_GRANT"
  | "EVENT_GROUP_CHANGE"
  | "EVENT_CATEGORY_CHANGE"
  // attendance
  | "ATTENDANCE_MARK"
  | "ATTENDANCE_CORRECT"
  // meetings
  | "MEETING_CREATE"
  | "MEETING_UPDATE"
  | "MEETING_START"
  | "MEETING_END"
  | "MEETING_CANCEL"
  | "MEETING_RESCHEDULE"
  | "MEETING_MOM"
  | "MEETING_ATTENDANCE_MARK"
  | "MEETING_LOCK"
  | "MEETING_UNLOCK"
  | "MEETING_FINALIZE"
  // hours
  | "HOURS_APPROVE"
  | "HOURS_ADJUST"
  | "HOURS_RECOMPUTE"
  | "HOURS_TYPE_CHANGE"
  // system
  | "CSV_EXPORT"            // PR exports only (Coordinator/Tech exports are not logged, 13.3)
  | "FEATURE_FLAG_CHANGE"
  | "SETTINGS_CHANGE"
  | "RETENTION_RUN"
  | "COUNTERS_REBUILD"
  | "CRON_RUN"
  | "RATE_LIMIT_TRIP"
  | "IMPORT_UNDO";

export type AuditEntityType =
  | "VOLUNTEER"
  | "PROJECT"
  | "EVENT"
  | "MEETING"
  | "ATTENDANCE"
  | "FCFS"
  | "HOURS"
  | "ROSTER"
  | "STAFF"
  | "REQUEST"
  | "EXPORT"
  | "SYSTEM";

export type AuditOutcome = "SUCCESS" | "FAILURE" | "DENIED";

export interface AuditSnapshot {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;                      // bigint as string
  at: string;
  actorRoll: string | null;
  actorName: string | null;        // joined from volunteers at read time
  effectiveRole: UserRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel?: string;
  targetRoll?: string;
  targetName?: string;
  projectContext?: ProjectName;
  outcome: AuditOutcome;
  correlationId: string;
  reason?: string;
  summary: string;                 // one concise sentence: who did what to whom/what
  changes?: Record<string, unknown>;   // minimal diff, never phone / blood group / gender / tokens
  clientIp?: string;

  // Compatibility aliases for mock-data / UI components
  timestamp?: string;
  actorId?: string;
  actorEmail?: string;
  snapshot?: AuditSnapshot;
  ipAddress?: string;
}

export interface AuditFilterState {
  search?: string;
  action?: AuditAction | "ALL";
  entityType?: AuditEntityType | "ALL";
  role?: UserRole | "ALL";
  outcome?: AuditOutcome | "ALL";
  project?: ProjectName | "ALL";
  actorRoll?: string;
  targetRoll?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;                // max 50
}
