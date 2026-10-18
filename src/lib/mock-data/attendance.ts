/**
 * Synthetic mock data for Attendance Records and Sessions.
 * Matches AttendanceRecord and AttendanceSummary types in src/types/event.ts.
 */

import type { AttendanceCorrection, AttendanceRecord, AttendanceSummary } from "@/types/event";
import { MOCK_EVENTS, MOCK_MEETINGS } from "./events";

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Event: Mega Blood Donation Camp 2026 (id: 1)
  {
    id: 1,
    attendanceFor: "EVENT",
    entityId: 1,
    eventId: 1,
    details: MOCK_EVENTS[0],
    markedBy: "2105404", // Priya Sundaram (Tech Team)
    correctionReason: "Volunteer arrived on second shift (11:00 AM - 05:00 PM) with prior approval.",
    correctedBy: "2105404",
    correctedAt: "2026-09-15T11:30:00Z",
  },
  // Event: Monsoon Urban Afforestation Drive (id: 2)
  {
    id: 2,
    attendanceFor: "EVENT",
    entityId: 2,
    eventId: 2,
    details: MOCK_EVENTS[1],
    markedBy: "2205901", // Ananya Roy (Dhara PR)
  },
  // Event: White Cane Day Awareness Walk (id: 3)
  {
    id: 3,
    attendanceFor: "EVENT",
    entityId: 3,
    eventId: 3,
    details: MOCK_EVENTS[2],
    markedBy: "2205903", // Shreya Ghosh (Swet PR)
  },
  // Event: Free Pediatric Health & Hygiene Camp (id: 4)
  {
    id: 4,
    attendanceFor: "EVENT",
    entityId: 4,
    eventId: 4,
    details: MOCK_EVENTS[3],
    markedBy: "2205902", // Tanmay Sen (Nidaan PR)
  },
  // Event: Old Age Care & Intergenerational Festival (id: 5)
  {
    id: 5,
    attendanceFor: "EVENT",
    entityId: 5,
    eventId: 5,
    details: MOCK_EVENTS[4],
    markedBy: "2205904", // Vikram Malhotra (Bandhutva PR)
  },
  // Meeting: Dhara Monthly Strategy (id: 2)
  {
    id: 6,
    attendanceFor: "MEETING",
    entityId: 2,
    eventId: 2,
    details: MOCK_MEETINGS[1],
    markedBy: "2205901", // Ananya Roy (Dhara PR)
  },
];

export const MOCK_ATTENDANCE_SUMMARIES: Record<string, AttendanceSummary> = {
  "1": {
    attendanceFor: "EVENT",
    entityId: 1,
    eventId: 1,
    totalEligible: 50,
    presentCount: 48,
    absentCount: 2,
    excusedCount: 1,
    turnoutPercentage: 96.0,
    isLocked: true,
  },
  "2": {
    attendanceFor: "EVENT",
    entityId: 2,
    eventId: 2,
    totalEligible: 40,
    presentCount: 36,
    absentCount: 3,
    excusedCount: 1,
    turnoutPercentage: 90.0,
    isLocked: true,
  },
  "3": {
    attendanceFor: "EVENT",
    entityId: 3,
    eventId: 3,
    totalEligible: 30,
    presentCount: 28,
    absentCount: 1,
    excusedCount: 1,
    turnoutPercentage: 93.3,
    isLocked: true,
  },
  "4": {
    attendanceFor: "EVENT",
    entityId: 4,
    eventId: 4,
    totalEligible: 35,
    presentCount: 32,
    absentCount: 2,
    excusedCount: 1,
    turnoutPercentage: 91.4,
    isLocked: true,
  },
  "5": {
    attendanceFor: "EVENT",
    entityId: 5,
    eventId: 5,
    totalEligible: 25,
    presentCount: 24,
    absentCount: 1,
    excusedCount: 0,
    turnoutPercentage: 96.0,
    isLocked: true,
  },
  "meet-2": {
    attendanceFor: "MEETING",
    entityId: 2,
    eventId: 2,
    totalEligible: 4,
    presentCount: 4,
    absentCount: 0,
    excusedCount: 0,
    turnoutPercentage: 100.0,
    isLocked: true,
  },
  // Backward compatibility keys for string IDs
  "evt-001": {
    attendanceFor: "EVENT",
    entityId: 1,
    eventId: "evt-001",
    totalEligible: 50,
    presentCount: 48,
    absentCount: 2,
    excusedCount: 1,
    turnoutPercentage: 96.0,
    isLocked: true,
  },
  "evt-002": {
    attendanceFor: "EVENT",
    entityId: 2,
    eventId: "evt-002",
    totalEligible: 40,
    presentCount: 36,
    absentCount: 3,
    excusedCount: 1,
    turnoutPercentage: 90.0,
    isLocked: true,
  },
};

export const MOCK_ATTENDANCE_CORRECTIONS: AttendanceCorrection[] = [
  {
    id: 1,
    attendanceFor: "EVENT",
    entityId: 1,
    rollNumber: "2105101",
    oldStatus: "ABSENT",
    newStatus: "PRESENT",
    reason: "Volunteer arrived on second shift (11:00 AM - 05:00 PM) with prior approval from Coordinator.",
    correctedBy: "2105404",
    correctedAt: "2026-09-15T11:30:00Z",
  },
  {
    id: 2,
    attendanceFor: "EVENT",
    entityId: 2,
    rollNumber: "2205128",
    oldStatus: "ABSENT",
    newStatus: "EXCUSED",
    reason: "Medical certificate submitted for sudden illness on plantation morning.",
    correctedBy: "2205901",
    correctedAt: "2026-09-23T14:15:00Z",
  },
  {
    id: 3,
    attendanceFor: "EVENT",
    entityId: 3,
    rollNumber: "2305211",
    oldStatus: "PRESENT",
    newStatus: "ABSENT",
    reason: "Marked present erroneously during morning roll call; volunteer departed before rally start.",
    correctedBy: "2205903",
    correctedAt: "2026-10-02T16:00:00Z",
  },
  {
    id: 4,
    attendanceFor: "EVENT",
    entityId: 4,
    rollNumber: "2105220",
    oldStatus: "ABSENT",
    newStatus: "PRESENT",
    reason: "Assisted with ambulance and pharmacy supplies escort; approved by Pediatric Camp Lead.",
    correctedBy: "2205902",
    correctedAt: "2026-10-08T15:20:00Z",
  },
];

export function getAttendanceCorrections(eventId: number | string): AttendanceCorrection[] {
  return MOCK_ATTENDANCE_CORRECTIONS.filter(
    (c) => String(c.entityId) === String(eventId) && c.attendanceFor === "EVENT"
  );
}

export function getEventParticipants(eventId: number | string): import("@/types/event").EventParticipant[] {
  const event = MOCK_EVENTS.find((e) => String(e.id) === String(eventId));
  if (!event) return [];

  const participants: import("@/types/event").EventParticipant[] = [];
  const addedRolls = new Set<string>();

  // 1. Attended or marked volunteers
  if (event.attendedVolunteers && event.attendedVolunteers.length > 0) {
    for (const b of event.attendedVolunteers) {
      if (!addedRolls.has(b.rollNumber)) {
        addedRolls.add(b.rollNumber);
        participants.push({
          eventId: event.id,
          volunteer: b,
          source: event.type === "CENTRAL" ? "FCFS" : "AUTO",
          status: "PRESENT",
          addedBy: event.createdBy?.rollNumber ?? "2105999",
          addedAt: event.createdAt,
          markedBy: "2105404",
          markedAt: event.startsAt,
        });
      }
    }
  }

  // 2. FCFS roster volunteers
  if (event.fcfsVolunteers && event.fcfsVolunteers.length > 0) {
    for (const b of event.fcfsVolunteers) {
      if (!addedRolls.has(b.rollNumber)) {
        addedRolls.add(b.rollNumber);
        const isPast = event.status === "COMPLETED";
        participants.push({
          eventId: event.id,
          volunteer: b,
          source: "FCFS",
          status: isPast ? "ABSENT" : "ABSENT",
          addedBy: event.createdBy?.rollNumber ?? "2105999",
          addedAt: event.createdAt,
          markedBy: isPast ? "2105404" : null,
          markedAt: isPast ? event.startsAt : null,
        });
      }
    }
  }

  // 3. For any remaining slots or default volunteers if roster is small, add mock volunteers
  if (participants.length < 5) {
    const defaultVols = event.projects.length > 0 && event.projects[0].projectName
      ? MOCK_EVENTS[0].attendedVolunteers ?? []
      : [];
    for (const b of defaultVols) {
      if (!addedRolls.has(b.rollNumber)) {
        addedRolls.add(b.rollNumber);
        participants.push({
          eventId: event.id,
          volunteer: b,
          source: "AUTO",
          status: "PRESENT",
          addedBy: "2105999",
          addedAt: event.createdAt,
          markedBy: "2105404",
          markedAt: event.startsAt,
        });
      }
    }
  }

  return participants;
}
