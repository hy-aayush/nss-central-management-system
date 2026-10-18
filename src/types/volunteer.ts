/**
 * Volunteer model and record definitions for NSS Central Management System.
 * Matches docs/SRS.md Sections 3, 6, 8.2, 10.3.
 */

import type { CreativeDomain, Domain, ProjectName } from "./project";
import type { UserRole } from "./auth";

export type VolunteerStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export const GENDER_LABELS: Record<Gender, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };
export interface GenderCounts { male: number; female: number; other: number }

/** Computed from batchYear. Usually 2, 3 or 4, but can be 1 or 5+ (new joiners, passed-out people). */
export type AcademicYear = number;
export const yearLabel = (y: number) => (y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : `${y}th`);
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

/** BASIC level: what POCs, other projects' PRs and emergency packs may see. */
export interface VolunteerBasic {
  rollNumber: string;                    // PK, validated by ROLL_NUMBER_PATTERN in src/config/identity.ts
  name: string;
  project: ProjectName | null;
}

/** Raw counters stored on volunteers. Rates are derived from these. */
export interface VolunteerStats {
  eventsAttended: number;                // PRESENT in any event, any source
  eventsFcfsFinal: number;               // finalised FCFS rows, PRESENT or ABSENT
  eventsFcfsPresent: number;
  eventsMissedFcfs: number;              // finalised FCFS rows ABSENT (penalty list size)
  meetingsPresent: number;
  meetingsAbsent: number;

  // Compatibility aliases
  eventsMissedAfterFcfs?: number;
  eventsRegisteredFcfs?: number;
  totalHours?: number;
  redFlagsCount?: number;
  attendanceRateMeetings?: number;
  attendanceRateEvents?: number;
}

/** List-row shape (FULL viewers). */
export interface VolunteerSummary extends VolunteerBasic {
  email: string;                         // DERIVED `${rollNumber}@${EMAIL_DOMAIN}`
  gender: Gender;                        // compulsory, FULL-only
  status: VolunteerStatus;
  year: AcademicYear;                    // DERIVED
  domains: CreativeDomain[];             // may be empty (= general volunteer only)
  officeRole: UserRole | null;           // highest active post, if any
  eventsAttendedCount: number;
  attendanceRateMeetings: number | null; // DERIVED: present / (present + absent) * 100, 1 decimal, null if 0 meetings
  attendanceRateEvents: number | null;   // DERIVED: eventsFcfsPresent / eventsFcfsFinal * 100, null if 0
  allocatedHours: number;
  redFlagsCount: number;
  phone?: string | null;
}

/** Profile shape (FULL viewers). */
export interface VolunteerDetail extends VolunteerSummary {
  phone: string | null;                  // restricted
  cityState: string | null;              // optional
  hostel: string | null;
  bloodGroup: BloodGroup | null;
  batchYear: number;
  joinDate: string;
  notes: string | null;
  notesUpdatedBy: string | null;
  notesUpdatedAt: string | null;
  notesEditsLeft: number | null;         // edit budget (11.2); null for people who are exempt
  stats: VolunteerStats;
  createdAt: string;
  updatedAt: string;
}

// Canonical alias for backward compatibility across UI components
export type Volunteer = VolunteerDetail;

/**
 * Historical queries:
 */
export type VolunteerHistoryKind =
  | "EVENTS_ATTENDED"           // event_participants where status = PRESENT
  | "EVENTS_MISSED_AFTER_FCFS"  // source = FCFS, status = ABSENT, event finalised
  | "EVENTS_REGISTERED_FCFS"    // source = FCFS, event not finalised and not CANCELLED (upcoming)
  | "MEETINGS_PRESENT"          // meeting_attendance, excused = false
  | "MEETINGS_ABSENT";          // derived: eligible finalised meetings with no attendance row

export interface RedFlag {
  id: number;
  rollNumber: string;
  reportedBy: VolunteerBasic;   // reporter is recorded and shown to FULL viewers only
  reason: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface VolunteerFilterState {
  search?: string;                                   // name ILIKE or roll prefix
  project?: ProjectName | "ALL";
  domain?: Domain | "ALL";
  status?: VolunteerStatus | "ALL";
  gender?: Gender | "ALL";
  year?: number | "ALL";
  sortBy?: "name" | "rollNumber" | "eventsAttended" | "hours" | "attendanceRate" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page: number;                                      // 1-based
  pageSize: number;                                  // max 50
}
