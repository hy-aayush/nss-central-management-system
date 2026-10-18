/**
 * Analytics and reporting summary types for NSS Central Management System.
 * Matches docs/SRS.md Sections 7, 10.8.
 */

import type { CreativeDomain, ProjectName } from "./project";
import type { GenderCounts } from "./volunteer";

export type AnalyticsScope =
  | { kind: "ORG" }                                  // Coordinator / Tech
  | { kind: "PROJECT"; projectIds: number[] };       // PRs (from ActorContext, never from the client)

export interface MetricCardData {
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  changePeriod?: string;
  description?: string;
}

/** Counts plus shares. Shares are computed from counts, one decimal. null when total is 0. */
export interface GenderBreakdown extends GenderCounts {
  total: number;
  femalePercent: number | null;
  malePercent: number | null;
  otherPercent: number | null;
}

export interface VolunteerMetrics {
  total: number;
  active: number;
  suspended: number;
  archived: number;
  newThisMonth: number;
  averageAttendanceRate: number | null;
  gender: GenderBreakdown;                           // over ACTIVE volunteers in scope
  byYear: { year: number; count: number; gender: GenderBreakdown }[];
}

export interface HoursMetrics {
  totalAllocated: number;      // sum of volunteer_year_hours.total for the selected year
  totalFromEvents: number;
  totalFromAdjustments: number;
  totalFromLegacy: number;
  eventsAwaitingApproval: number;   // COMPLETED, non-imported events without hours_approved_at

  // Compatibility aliases
  totalCompleted?: number;
  totalApproved?: number;
  totalPending?: number;
}

export interface EventMetrics {
  totalEvents: number;
  completedEvents: number;
  scheduledEvents: number;
  cancelledEvents: number;
  centralEventsCount: number;
  projectEventsCount: number;
  upcomingThisMonth: number;
  genderPresent: GenderBreakdown;                    // sum of the finalised events' snapshots
}

export interface MeetingMetrics {
  totalMeetings: number;
  completedMeetings: number;
  projectMeetings: number;
  centralMeetings: number;
  buildersMeetings: number;
  averageTurnout: number | null;
  genderPresent: GenderBreakdown;
}

export interface ProjectAnalyticsSummary {
  projectName: ProjectName;
  slug: string;
  volunteersCount: number;
  activeVolunteersCount: number;
  eventsCount: number;
  meetingsCount: number;
  hoursCompleted: number;
  attendanceRate: number | null;
  status: "ACTIVE" | "INACTIVE";
  prNames: string[];
  gender: GenderBreakdown;

  // Compatibility
  leadPrName?: string;
}

export interface DomainAnalyticsSummary {
  domain: CreativeDomain;
  memberCount: number;
  percentageOfTotal: number;
  overlapWith: { domain: CreativeDomain; count: number }[];
  gender: GenderBreakdown;

  // Compatibility
  primaryCount?: number;
}

export interface MonthlyTrendPoint {
  month: string;               // "2026-09" (IST month)
  eventsCount: number;
  meetingsCount: number;
  volunteersPresent: number;
  attendanceRate: number | null;
  hoursCompleted: number;
  genderPresent: GenderCounts;
}

export interface DataQualityIssue {
  id: string;
  type:
    | "MISSING_PROJECT"
    | "PROJECT_PR_VACANCY"
    | "UNAPPROVED_HOURS"
    | "UNLOCKED_PAST_EVENT"
    | "ATTENDANCE_NOT_TAKEN"
    | "MISSING_MOM"
    | "MISSING_PHONE"
    | "STALE_VOLUNTEER"
    | "ROTATION_DUE"
    | "PASSED_OUT_NOT_ARCHIVED"
    | "OLD_PENDING_REQUEST"
    | "STUCK_DRAFT_EVENT";
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  affectedCount: number;
  targetUrl: string;           // internal URL with filters, never contains personal data
}

export interface DashboardSummary {
  scope: AnalyticsScope["kind"];
  academicYear: number;
  volunteers: VolunteerMetrics;
  hours: HoursMetrics;
  events: EventMetrics;
  meetings: MeetingMetrics;
  projectSummaries: ProjectAnalyticsSummary[];       // ORG: 9 rows; PROJECT: only their own
  domainSummaries: DomainAnalyticsSummary[];         // ORG only
  monthlyTrends: MonthlyTrendPoint[];
  dataQualityIssues: DataQualityIssue[];
  lastUpdated: string;
}
