/**
 * Unified data access layer for synthetic mock data.
 * Provides typed query helpers for pages without embedding raw data arrays in UI components.
 */

import { MOCK_AUDIT_LOGS } from "./audit-logs";
import { MOCK_ATTENDANCE_RECORDS, MOCK_ATTENDANCE_SUMMARIES } from "./attendance";
import { MOCK_DASHBOARD_SUMMARY, MOCK_METRIC_CARDS } from "./analytics";
import { MOCK_EVENTS, MOCK_MEETINGS } from "./events";
import { MOCK_DOMAINS, MOCK_PROJECTS } from "./projects";
import { MOCK_ROSTER_ENTRIES, MOCK_STAFF_MEMBERS, MOCK_STAFF_USERS } from "./staff";
import { MOCK_VOLUNTEERS } from "./volunteers";

import type { AuditFilterState, AuditLogEntry } from "@/types/audit";
import type { AttendanceRecord, AttendanceSummary, EventFilterState, EventRecord, Meeting, MeetingFilterState } from "@/types/event";
import type { CreativeDomain, DomainSummary, Project, ProjectName } from "@/types/project";
import type { RosterEntry, User } from "@/types/auth";
import type { DashboardSummary, MetricCardData } from "@/types/analytics";
import type { Volunteer, VolunteerDetail, VolunteerFilterState } from "@/types/volunteer";

// Re-export raw mock datasets
export {
  MOCK_VOLUNTEERS,
  MOCK_PROJECTS,
  MOCK_DOMAINS,
  MOCK_EVENTS,
  MOCK_MEETINGS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTENDANCE_SUMMARIES,
  MOCK_STAFF_USERS,
  MOCK_STAFF_MEMBERS,
  MOCK_ROSTER_ENTRIES,
  MOCK_AUDIT_LOGS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_METRIC_CARDS,
};

// ============================================================================
// Volunteers Helpers
// ============================================================================

export function getVolunteers(filters?: Partial<VolunteerFilterState>): {
  items: VolunteerDetail[];
  total: number;
} {
  let list = [...MOCK_VOLUNTEERS];

  if (!filters) {
    return { items: list, total: list.length };
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.rollNumber.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q)
    );
  }

  if (filters.project && filters.project !== "ALL") {
    list = list.filter((v) => v.project === filters.project);
  }

  if (filters.domain && filters.domain !== "ALL") {
    list = list.filter((v) =>
      filters.domain === "GENERAL_VOLUNTEERING"
        ? true
        : v.domains.includes(filters.domain as CreativeDomain)
    );
  }

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((v) => v.status === filters.status);
  }

  if (filters.year && filters.year !== "ALL") {
    list = list.filter((v) => v.year === filters.year);
  }

  if (filters.gender && filters.gender !== "ALL") {
    list = list.filter((v) => v.gender === filters.gender);
  }

  // Sorting
  if (filters.sortBy) {
    const order = filters.sortOrder === "desc" ? -1 : 1;
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * order;
        case "rollNumber":
          return a.rollNumber.localeCompare(b.rollNumber) * order;
        case "eventsAttended":
          return (a.eventsAttendedCount - b.eventsAttendedCount) * order;
        case "hours":
          return (a.allocatedHours - b.allocatedHours) * order;
        case "attendanceRate":
          return ((a.attendanceRateEvents ?? 0) - (b.attendanceRateEvents ?? 0)) * order;
        case "updatedAt":
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
        default:
          return 0;
      }
    });
  }

  const total = list.length;
  if (filters.page && filters.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    list = list.slice(start, start + filters.pageSize);
  }

  return { items: list, total };
}

export function getVolunteerByRoll(rollNumber: string): VolunteerDetail | undefined {
  return MOCK_VOLUNTEERS.find((v) => v.rollNumber === rollNumber);
}

// Backward-compatible alias for getVolunteerByRoll
export function getVolunteerById(id: string): Volunteer | undefined {
  return MOCK_VOLUNTEERS.find((v) => v.rollNumber === id);
}

// ============================================================================
// Projects Helpers
// ============================================================================

export function getProjects(): Project[] {
  return MOCK_PROJECTS;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return MOCK_PROJECTS.find(
    (p) =>
      p.slug.toLowerCase() === slug.toLowerCase() ||
      p.name.toLowerCase() === slug.toLowerCase()
  );
}

export function getProjectById(id: number): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id);
}

export function getProjectByName(name: ProjectName): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.name === name);
}

export function getCreativeDomains(): DomainSummary[] {
  return MOCK_DOMAINS;
}

// ============================================================================
// Events & Meetings Helpers
// ============================================================================

export function getEvents(filters?: Partial<EventFilterState>): {
  items: EventRecord[];
  total: number;
} {
  let list = [...MOCK_EVENTS];

  if (!filters) {
    return { items: list, total: list.length };
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }

  const typeFilter = filters.type ?? filters.eventType;
  if (typeFilter && typeFilter !== "ALL") {
    list = list.filter((e) => e.type === typeFilter);
  }

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((e) => e.status === filters.status);
  }

  if (filters.project && filters.project !== "ALL") {
    list = list.filter((e) =>
      e.projectName === filters.project ||
      e.projects.some((p) => p.projectName === filters.project)
    );
  }

  const total = list.length;
  if (filters.page && filters.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    list = list.slice(start, start + filters.pageSize);
  }

  return { items: list, total };
}

export function getEventById(id: string | number): EventRecord | undefined {
  return MOCK_EVENTS.find((e) => String(e.id) === String(id));
}

export function getEventsByProject(projectName: ProjectName): EventRecord[] {
  return MOCK_EVENTS.filter(
    (e) =>
      e.projectName === projectName ||
      e.projects.some((p) => p.projectName === projectName)
  );
}

export function getMeetings(filters?: Partial<MeetingFilterState>): {
  items: Meeting[];
  total: number;
} {
  let list = [...MOCK_MEETINGS];

  if (!filters) {
    return { items: list, total: list.length };
  }

  if (filters.type && filters.type !== "ALL") {
    list = list.filter((m) => m.type === filters.type);
  }

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((m) => m.status === filters.status);
  }

  if (filters.project && filters.project !== "ALL") {
    list = list.filter((m) => m.project === filters.project);
  }

  const total = list.length;
  if (filters.page && filters.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    list = list.slice(start, start + filters.pageSize);
  }

  return { items: list, total };
}

export function getMeetingById(id: string | number): Meeting | undefined {
  return MOCK_MEETINGS.find((m) => String(m.id) === String(id));
}

// ============================================================================
// Attendance Helpers
// ============================================================================

export function getAttendanceByEventId(eventId: string | number): AttendanceRecord[] {
  return MOCK_ATTENDANCE_RECORDS.filter(
    (a) => String(a.entityId) === String(eventId) || String(a.eventId) === String(eventId)
  );
}

export function getAttendanceSummary(eventId: string | number): AttendanceSummary | undefined {
  return MOCK_ATTENDANCE_SUMMARIES[String(eventId)];
}

// ============================================================================
// Audit Logs Helpers
// ============================================================================

export function getAuditLogs(filters?: Partial<AuditFilterState>): {
  items: AuditLogEntry[];
  total: number;
} {
  let list = [...MOCK_AUDIT_LOGS];

  if (!filters) {
    return { items: list, total: list.length };
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (l) =>
        (l.actorName && l.actorName.toLowerCase().includes(q)) ||
        (l.actorRoll && l.actorRoll.toLowerCase().includes(q)) ||
        (l.actorEmail && l.actorEmail.toLowerCase().includes(q)) ||
        (l.summary && l.summary.toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q)) ||
        (l.entityLabel && l.entityLabel.toLowerCase().includes(q))
    );
  }

  if (filters.action && filters.action !== "ALL") {
    list = list.filter((l) => l.action === filters.action);
  }

  if (filters.entityType && filters.entityType !== "ALL") {
    list = list.filter((l) => l.entityType === filters.entityType);
  }

  if (filters.role && filters.role !== "ALL") {
    list = list.filter((l) => l.effectiveRole === filters.role);
  }

  if (filters.outcome && filters.outcome !== "ALL") {
    list = list.filter((l) => l.outcome === filters.outcome);
  }

  if (filters.project && filters.project !== "ALL") {
    list = list.filter((l) => l.projectContext === filters.project);
  }

  const total = list.length;
  if (filters.page && filters.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    list = list.slice(start, start + filters.pageSize);
  }

  return { items: list, total };
}

// ============================================================================
// Staff & Roster Helpers
// ============================================================================

export function getStaffMembers(): User[] {
  return MOCK_STAFF_USERS;
}

export function getStaffMemberByRoll(rollNumber: string): User | undefined {
  return MOCK_STAFF_USERS.find((s) => s.details.rollNumber === rollNumber);
}

export function getStaffMemberById(id: string): User | undefined {
  return MOCK_STAFF_USERS.find((s) => s.details.rollNumber === id);
}

export function getRosterEntries(): RosterEntry[] {
  return MOCK_ROSTER_ENTRIES;
}

// ============================================================================
// Analytics Helpers
// ============================================================================

export function getDashboardSummary(): DashboardSummary {
  return MOCK_DASHBOARD_SUMMARY;
}

export function getMetricCards(): MetricCardData[] {
  return MOCK_METRIC_CARDS;
}

// ============================================================================
// Specialized Volunteer Detail & Project View Helpers
// ============================================================================

export function getVolunteersByProject(projectName: ProjectName): VolunteerDetail[] {
  return MOCK_VOLUNTEERS.filter((v) => v.project === projectName);
}

export function getVolunteerEvents(rollNumber: string): {
  attended: EventRecord[];
  upcomingOrRegistered: EventRecord[];
} {
  const attended = MOCK_EVENTS.filter(
    (e) =>
      e.status === "COMPLETED" &&
      (e.attendedVolunteers?.some((v) => v.rollNumber === rollNumber) ||
        e.fcfsVolunteers?.some((v) => v.rollNumber === rollNumber))
  );

  const upcomingOrRegistered = MOCK_EVENTS.filter(
    (e) =>
      ["SCHEDULED", "PUBLISHED", "RESCHEDULED", "ONGOING"].includes(e.status) &&
      (e.fcfsVolunteers?.some((v) => v.rollNumber === rollNumber) ||
        e.projects.some((p) => {
          const vol = getVolunteerByRoll(rollNumber);
          return vol && p.projectName === vol.project;
        }))
  );

  return { attended, upcomingOrRegistered };
}

export function getVolunteerAuditLogs(rollNumber: string): AuditLogEntry[] {
  return MOCK_AUDIT_LOGS.filter(
    (l) => l.targetRoll === rollNumber || l.actorRoll === rollNumber
  );
}

export function getDomainByCode(code: string): DomainSummary | undefined {
  return MOCK_DOMAINS.find((d) => d.domain.toLowerCase() === code.toLowerCase());
}
