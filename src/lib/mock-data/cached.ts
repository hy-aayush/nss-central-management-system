import { cacheLife, cacheTag } from "next/cache";

import { academicYearStart } from "@/lib/time";

import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTENDANCE_SUMMARIES,
  MOCK_VOLUNTEERS,
  MOCK_VOLUNTEER_YEAR_HOURS,
  getAdjustmentTypes,
  getAuditLogs,
  getCreativeDomains,
  getDashboardSummary,
  getEventById,
  getEventParticipants,
  getEvents,
  getHoursAdjustments,
  getHoursApprovalRows,
  getHoursRecomputeState,
  getMeetingAudienceRows,
  getMeetingById,
  getMeetingListItems,
  getMeetings,
  getMetricCards,
  getProjects,
  getRosterEntries,
  getVolunteers,
} from "./index";

/**
 * Cached, request-independent page payloads.
 *
 * Everything the office screens render is synthetic and identical for every
 * signed-in member, so building it per request is wasted CPU (and, on Vercel,
 * wasted function time). Each helper below is a `use cache` scope with an
 * hour-long life: the first request in a window computes the aggregates, every
 * later request — including prefetches and repeat navigations — reads the
 * cached result.
 *
 * Two rules hold for every function here:
 *
 * 1. Authorization is *outside* the cache. Pages call
 *    `requireOfficeAccess()` first; nothing in this module reads a session,
 *    cookie, header or search param.
 * 2. Arguments are plain values (an id, a year), so the cache key stays stable
 *    and small. Never pass a token, email or other personal data in.
 *
 * Since the underlying fixtures never change at runtime, tags exist only so a
 * future real repository can invalidate a route with `revalidateTag` /
 * `updateTag` (`"events"`, `"meetings"`, `"hours"`, `"roster"`, …).
 */

export async function getDashboardSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard");

  return {
    summary: getDashboardSummary(),
    metricCards: getMetricCards(),
    events: getEvents().items,
    meetings: getMeetings().items,
    projects: getProjects(),
    auditLogs: getAuditLogs().items,
    attendanceRecords: MOCK_ATTENDANCE_RECORDS,
    attendanceSummaries: MOCK_ATTENDANCE_SUMMARIES,
  };
}

export async function getEventsSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  return { events: getEvents().items };
}

/** One event plus its enrolled roster, computed once per event id. */
export async function getEventSnapshot(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  const event = getEventById(id);

  if (!event) {
    return null;
  }

  return { event, participants: getEventParticipants(event.id) };
}

export async function getAuditSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("audit");

  return { logs: getAuditLogs().items };
}

export async function getMeetingsSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("meetings");

  return {
    meetings: getMeetings().items,
    listItems: getMeetingListItems(),
  };
}

/**
 * One meeting plus its computed audience. The id is the whole cache key, so a
 * detail page never rebuilds the roster of every meeting to show one of them.
 */
export async function getMeetingSnapshot(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("meetings");

  const meeting = getMeetingById(id);

  if (!meeting) {
    return null;
  }

  return { meeting, rows: getMeetingAudienceRows(meeting) };
}

/**
 * One academic year of the hours ledger.
 *
 * The year is the whole cache key, so the two years the selector offers are two
 * independent entries: approving or recomputing a later year cannot evict the
 * earlier one, and a future third year costs one entry rather than a rebuild of
 * every year's rows.
 */
export async function getHoursYearSnapshot(year: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("hours");

  return {
    approvalRows: getHoursApprovalRows(year),
    recompute: getHoursRecomputeState(year),
  };
}

/**
 * The hours ledger for the academic years the page offers.
 *
 * The current academic year is derived *inside* the cache scope: reading the
 * clock in the page body is an unstable value under Cache Components, and this
 * value only changes once a year, so it belongs with the rest of the cached
 * snapshot rather than being recomputed per request.
 */
export async function getHoursSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("hours");

  const currentYear = academicYearStart(new Date());
  const years = [currentYear, currentYear - 1];
  const byYear = await Promise.all(
    years.map((year) => getHoursYearSnapshot(year)),
  );

  return {
    currentYear,
    years,
    approvalRowsByYear: Object.fromEntries(
      years.map((year, index) => [year, byYear[index].approvalRows]),
    ),
    recomputeByYear: Object.fromEntries(
      years.map((year, index) => [year, byYear[index].recompute]),
    ),
    adjustments: getHoursAdjustments(),
    tags: getAdjustmentTypes(),
    rollups: MOCK_VOLUNTEER_YEAR_HOURS.filter((row) =>
      years.includes(row.academicYear),
    ),
    volunteers: MOCK_VOLUNTEERS.map((volunteer) => ({
      rollNumber: volunteer.rollNumber,
      name: volunteer.name,
      project: volunteer.project,
    })),
    events: getEvents()
      .items.filter((event) => event.status === "COMPLETED")
      .map((event) => ({ id: event.id, title: event.title })),
    volunteerCount: MOCK_VOLUNTEERS.length,
  };
}

/**
 * The unit-wide figures several routes show in their header.
 *
 * Dashboard, projects, volunteers and analytics each used to build this inside
 * their own cache entry; now they share one `unit` entry, so moving between
 * those screens reuses a single cached value instead of four.
 */
export async function getUnitSummary() {
  "use cache";
  cacheLife("hours");
  cacheTag("unit-summary");

  return getDashboardSummary();
}

export async function getAttendanceSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("attendance");

  return { events: getEvents().items };
}

export async function getProjectsSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");

  return {
    projects: getProjects(),
    domains: getCreativeDomains(),
    summary: await getUnitSummary(),
  };
}

export async function getVolunteersSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("roster");

  return {
    volunteers: getVolunteers().items,
    summary: await getUnitSummary(),
  };
}

export async function getTeamSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("roster");

  return { entries: getRosterEntries() };
}

export async function getAnalyticsSnapshot() {
  "use cache";
  cacheLife("hours");
  cacheTag("analytics");

  return { summary: await getUnitSummary() };
}
