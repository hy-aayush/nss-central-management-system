/**
 * Synthetic mock data for Attendance Records and Sessions.
 * Matches AttendanceRecord and AttendanceSummary types in src/types/event.ts.
 */

import type { AttendanceRecord, AttendanceSummary } from "@/types/event";
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
