/**
 * Meeting audience and attendance helpers (SRS 11.8).
 *
 * Audience by type:
 *  - PROJECT  : ACTIVE volunteers of that project
 *  - CENTRAL  : every ACTIVE volunteer
 *  - BUILDERS : holders of an active BUILDER or PROJECT_REPRESENTATIVE post
 *
 * Nobody in the 4th year, and no Coordinator/Tech member, is ever counted
 * absent (decision D-20). They still appear so they can be marked present.
 *
 * Attendance is stored present-only: a missing row means absent.
 */

import { MOCK_MEETINGS } from "./events";
import { MOCK_VOLUNTEERS } from "./volunteers";

import type { Meeting } from "@/types/event";
import type { VolunteerDetail } from "@/types/volunteer";

export type MeetingAudienceStatus = "PRESENT" | "ABSENT" | "EXCUSED";

export interface MeetingAudienceRow {
  volunteer: VolunteerDetail;
  status: MeetingAudienceStatus;
  /** Present in the penalty denominator: 2nd/3rd year and not an office bearer. */
  countsForAbsence: boolean;
  isOfficeBearer: boolean;
}

export interface MeetingCounts {
  /** Everyone who can be marked for this meeting. */
  audience: number;
  /** Denominator for absence: 2nd/3rd years without an office post. */
  eligible: number;
  present: number;
  excused: number;
  absent: number;
  turnout: number | null;
}

export interface MeetingListItem {
  meeting: Meeting;
  counts: MeetingCounts;
}

export interface MeetingAttendanceEntry {
  rollNumber: string;
  excused: boolean;
}

export function isOfficeBearer(volunteer: VolunteerDetail): boolean {
  return volunteer.officeRole === "COORDINATOR" || volunteer.officeRole === "TECH_TEAM";
}

/** The people this meeting can mark. */
export function getMeetingAudience(meeting: Meeting): VolunteerDetail[] {
  const active = MOCK_VOLUNTEERS.filter(
    (volunteer) =>
      volunteer.status === "ACTIVE" && volunteer.joinDate <= meeting.date,
  );

  switch (meeting.type) {
    case "PROJECT":
      return active.filter((volunteer) => volunteer.project === meeting.project);
    case "BUILDERS":
      return active.filter(
        (volunteer) =>
          volunteer.officeRole === "BUILDER" ||
          volunteer.officeRole === "PROJECT_REPRESENTATIVE",
      );
    case "CENTRAL":
    default:
      return active;
  }
}

/** Present-only rows; meetings without rows simply have no attendance taken. */
export const MOCK_MEETING_ATTENDANCE: Record<number, MeetingAttendanceEntry[]> = {
  1: [
    { rollNumber: "2105101", excused: false },
    { rollNumber: "2105404", excused: false },
    { rollNumber: "2205128", excused: false },
    { rollNumber: "2205115", excused: true },
  ],
  2: [
    { rollNumber: "2105101", excused: false },
    { rollNumber: "2105220", excused: false },
    { rollNumber: "2205128", excused: false },
    { rollNumber: "2205340", excused: false },
  ],
  3: [
    { rollNumber: "2105101", excused: false },
    { rollNumber: "2205340", excused: false },
  ],
  4: [],
  5: [
    { rollNumber: "2105101", excused: false },
    { rollNumber: "2105404", excused: false },
    { rollNumber: "2205128", excused: false },
    { rollNumber: "2205115", excused: false },
    { rollNumber: "2105220", excused: false },
    { rollNumber: "2205340", excused: false },
  ],
  6: [],
  7: [],
  8: [],
};

export function getMeetingAttendance(meetingId: number): MeetingAttendanceEntry[] {
  return MOCK_MEETING_ATTENDANCE[meetingId] ?? [];
}

export function getMeetingAudienceRows(meeting: Meeting): MeetingAudienceRow[] {
  const attendance = getMeetingAttendance(meeting.id);
  const byRoll = new Map(attendance.map((entry) => [entry.rollNumber, entry]));

  return getMeetingAudience(meeting).map((volunteer) => {
    const entry = byRoll.get(volunteer.rollNumber);
    const officeBearer = isOfficeBearer(volunteer);

    return {
      volunteer,
      status: entry ? (entry.excused ? "EXCUSED" : "PRESENT") : "ABSENT",
      countsForAbsence:
        (volunteer.year === 2 || volunteer.year === 3) && !officeBearer,
      isOfficeBearer: officeBearer,
    };
  });
}

export function getMeetingCounts(meeting: Meeting): MeetingCounts {
  const rows = getMeetingAudienceRows(meeting);
  const eligible = rows.filter((row) => row.countsForAbsence).length;
  const present = rows.filter((row) => row.status === "PRESENT").length;
  const excused = rows.filter((row) => row.status === "EXCUSED").length;
  const absent = rows.filter(
    (row) => row.status === "ABSENT" && row.countsForAbsence,
  ).length;

  return {
    audience: rows.length,
    eligible,
    present,
    excused,
    absent,
    turnout: eligible > 0 ? Math.round((present / eligible) * 1000) / 10 : null,
  };
}

/** Most recent first — the list and the stats strip share this order. */
export function getMeetingListItems(): MeetingListItem[] {
  return [...MOCK_MEETINGS]
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
    .map((meeting) => ({ meeting, counts: getMeetingCounts(meeting) }));
}

/** Minutes are editable only after the meeting is completed. */
export function canWriteMinutes(meeting: Meeting): boolean {
  return meeting.status === "COMPLETED";
}

export function minutesWordCount(mom: string | null): number {
  if (!mom) return 0;
  return mom.trim().split(/\s+/).filter(Boolean).length;
}
