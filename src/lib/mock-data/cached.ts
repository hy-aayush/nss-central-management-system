import { cacheLife } from "next/cache";

import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTENDANCE_SUMMARIES,
  getAuditLogs,
  getDashboardSummary,
  getEvents,
  getMeetings,
  getMetricCards,
  getProjects,
} from "./index";

/**
 * The dashboard reads only synthetic, request-independent data — no session,
 * no search params, no cookies. Caching it with `use cache` means the module
 * graph and the derived aggregates run once per cache window instead of once
 * per request, which is what makes repeat navigation feel immediate.
 *
 * Authorization is deliberately *outside* this function: the page calls
 * `requireOfficeAccess()` before reading the snapshot, and the gate itself is
 * never cached (see docs/DECISIONS.md).
 */
export async function getDashboardSnapshot() {
  "use cache";
  cacheLife("hours");

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
