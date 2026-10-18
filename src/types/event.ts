/**
 * Event, Meeting, and Attendance types for NSS Central Management System.
 * Matches docs/SRS.md Sections 5, 6, 8.3, 8.4, 8.5, 10.4.
 */

import type { UserRole } from "./auth";
import type { ProjectId, ProjectName } from "./project";
import type { GenderCounts, VolunteerBasic, VolunteerSummary } from "./volunteer";

export type EventType = "CENTRAL" | "PROJECT";
export type ParticipationMode = "FCFS" | "OPEN_TO_ALL";        // OPEN_TO_ALL only for CENTRAL

export type StoredEventStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

/** ONGOING is computed by effectiveEventStatus(); it is never written to the DB. */
export type EventStatus = StoredEventStatus | "ONGOING";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";
export type ParticipantSource = "FCFS" | "WALK_IN" | "AUTO";
export type CollabApproval = "PENDING" | "APPROVED" | "REJECTED";

export interface EventProjectSlot {
  projectId: ProjectId;
  projectName: ProjectName;
  isHost: boolean;                       // true = host/collaborating project
  approval: CollabApproval;              // hosts other than the creator's start as PENDING
  approvedBy: string | null;
  approvedAt: string | null;
  slotsTotal: number | null;             // slot-holders only. A guardrail (S-01), not a wall
  capYear2: number | null;               // optional per-year limits
  capYear3: number | null;
  capYear4: number | null;
  filled: number;                        // current FCFS/WALK_IN rows for this project
  editsLeft: number | null;              // edit budget for this project's name list; null = exempt viewer
}

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  type: EventType;
  participation: ParticipationMode;
  status: EventStatus;                   // effective (derived) status
  venue: string;
  startsAt: string;
  endsAt: string | null;
  fcfsOpensAt: string | null;
  fcfsLockAt: string | null;
  isFcfsOpen: boolean;                   // DERIVED: PUBLISHED/RESCHEDULED && now in [opens, lock)
  attendanceOpensAt: string;             // startsAt - 15 minutes
  attendanceLockAt: string;              // start of the next IST day (exclusive)
  isAttendanceLocked: boolean;           // DERIVED: stored flag OR now >= attendanceLockAt
  isFinalized: boolean;
  needsReview: boolean;                  // DERIVED: locked, not finalised, and nobody ever marked attendance (11.7)
  category: { id: number; name: string } | null;
  group: { id: number; title: string } | null;
  countsForGroup: boolean;
  hours: number | null;                  // assigned later
  hoursApproved: boolean;
  academicYear: number;
  projects: EventProjectSlot[];
  createdBy: VolunteerBasic | null;      // null for imported events
  createdByRole: UserRole | null;
  rescheduleCount: number;
  editsLeft: number | null;              // edit budget of the event details; null = exempt viewer
  cancellationReason: string | null;
  registeredCount: number;               // FCFS + WALK_IN rows
  eligibleCount: number | null;          // snapshot at finalise
  presentCount: number | null;           // snapshot at finalise (office bearers excluded)
  genderPresent: GenderCounts | null;    // snapshot at finalise
  isImported: boolean;
  createdAt: string;
  updatedAt: string;

  // Compatibility properties
  eventType?: EventType;
  projectName?: ProjectName;
  startTime?: string;
  endTime?: string;
  allocatedHours?: number;
  attendedVolunteers?: VolunteerBasic[];
  fcfsVolunteers?: VolunteerBasic[];
  presentAttendees?: number;
  expectedAttendees?: number;
}

export interface EventParticipant {
  eventId: number;
  volunteer: VolunteerBasic | VolunteerSummary;   // level depends on viewer (Section 6)
  source: ParticipantSource;
  status: AttendanceStatus;
  addedBy: string;
  addedAt: string;
  markedBy: string | null;
  markedAt: string | null;
}

export type MeetingType = "PROJECT" | "CENTRAL" | "BUILDERS";
export type MeetingStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface Meeting {
  id: number;
  type: MeetingType;
  project: ProjectName | null;           // required for PROJECT
  agenda: string;
  date: string;                          // "YYYY-MM-DD" IST
  startTime: string;                     // "HH:mm" IST
  endTime: string | null;
  venue: string;
  status: MeetingStatus;
  startedAt: string | null;
  endedAt: string | null;
  mom: string | null;                    // max 100 words
  momBy: string | null;
  momEditsLeft: number | null;
  editsLeft: number | null;
  isAttendanceLocked: boolean;           // DERIVED: stored flag OR now >= attendanceLockAt
  attendanceLockAt: string;
  isFinalized: boolean;
  needsReview: boolean;                  // DERIVED: locked, not finalised, no attendance rows
  eligibleCount: number | null;          // snapshot at finalise
  presentCount: number | null;
  genderPresent: GenderCounts | null;
  cancellationReason: string | null;
  createdBy: VolunteerBasic;
  createdByRole: UserRole;
  createdAt: string;
  updatedAt: string;

  // Compatibility properties
  Attendance?: number[];
}

export interface AttendanceCorrection {
  id: number;
  attendanceFor: "EVENT" | "MEETING";
  entityId: number;
  rollNumber: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;                        // min 10 chars
  correctedBy: string;
  correctedAt: string;
}

export interface AttendanceSummary {
  attendanceFor: "EVENT" | "MEETING";
  entityId: number;
  totalEligible: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  turnoutPercentage: number | null;      // office bearers excluded
  isLocked: boolean;

  // Compatibility
  eventId?: string | number;
}

// Compatibility shape for mock data / UI
export interface AttendanceRecord {
  id?: number | string;
  attendanceFor: "EVENT" | "MEETING" | "Event" | "Meeting";
  entityId?: number;
  eventId?: string | number;
  details?: Meeting | EventRecord;
  markedBy: string;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export interface EventFilterState {
  search?: string;
  type?: EventType | "ALL";
  status?: EventStatus | "ALL";
  project?: ProjectName | "ALL";
  groupId?: number;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;                      // max 50
  // Compatibility
  eventType?: EventType | "ALL";
}

export interface MeetingFilterState {
  type?: MeetingType | "ALL";
  project?: ProjectName | "ALL";
  status?: MeetingStatus | "ALL";
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}
