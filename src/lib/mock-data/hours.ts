/**
 * Synthetic data for hours management: event categories (SRS A.2), adjustment
 * tags (A.3), tagged adjustments, yearly rollups and approval rows (11.9).
 * All numbers are derived from the volunteer dataset so a profile total and the
 * yearly rollup never disagree.
 */

import { MOCK_EVENTS } from "./events";
import { MOCK_VOLUNTEERS } from "./volunteers";

import type {
  AdjustmentType,
  EventCategory,
  HoursAdjustment,
  HoursApprovalRow,
  HoursRecomputeState,
  VolunteerYearHours,
} from "@/types/hours";

/** Appendix A.2 — editable data, not code. */
export const MOCK_EVENT_CATEGORIES: EventCategory[] = [
  { id: 1, name: "Old age home visit", defaultHours: 5, isActive: true },
  { id: 2, name: "Orphanage visit", defaultHours: 5, isActive: true },
  { id: 3, name: "Cleanliness drive", defaultHours: 3, isActive: true },
  { id: 4, name: "Plantation drive", defaultHours: 3, isActive: true },
  { id: 5, name: "Rally", defaultHours: 3, isActive: true },
  { id: 6, name: "Slum visit", defaultHours: 4, isActive: true },
  { id: 7, name: "School visit", defaultHours: 4, isActive: true },
  { id: 8, name: "Yoga Day event", defaultHours: 2, isActive: true },
  { id: 9, name: "Nukkad natak", defaultHours: 12, isActive: true },
  { id: 10, name: "Flash mob", defaultHours: 12, isActive: true },
  { id: 11, name: "Blood donation", defaultHours: 8, isActive: true },
  { id: 12, name: "NSS Day", defaultHours: 5, isActive: true },
  { id: 13, name: "Republic Day (participation)", defaultHours: 50, isActive: true },
  { id: 14, name: "Anna Daan", defaultHours: 8, isActive: true },
  { id: 15, name: "Sneh Daan", defaultHours: 4, isActive: true },
];

/** Appendix A.3 — starter tag set; tags are deactivated, never deleted. */
export const MOCK_ADJUSTMENT_TYPES: AdjustmentType[] = [
  { id: 1, name: "Photography at an event", defaultHours: 1, isActive: true },
  { id: 2, name: "Graphic design task", defaultHours: 2, isActive: true },
  { id: 3, name: "Video editing task", defaultHours: 2, isActive: true },
  { id: 4, name: "Content writing task", defaultHours: 2, isActive: true },
  { id: 5, name: "Position held (PR, POC, Domain Lead)", defaultHours: 6, isActive: true },
  { id: 6, name: "Event performance (recognition)", defaultHours: 4, isActive: false },
];

const roll = (index: number) => MOCK_VOLUNTEERS[index % MOCK_VOLUNTEERS.length].rollNumber;

const tagName = (typeId: number) =>
  MOCK_ADJUSTMENT_TYPES.find((tag) => tag.id === typeId)?.name ?? "Adjustment";

export const MOCK_HOURS_ADJUSTMENTS: HoursAdjustment[] = [
  {
    id: 1,
    rollNumber: roll(1),
    typeId: 1,
    typeName: tagName(1),
    occurredOn: "2026-10-24",
    academicYear: 2026,
    hours: 1,
    description: "Photographed the central blood donation camp for the annual report.",
    eventId: 1,
    createdBy: roll(0),
    createdAt: "2026-10-25T06:10:00Z",
  },
  {
    id: 2,
    rollNumber: roll(2),
    typeId: 2,
    typeName: tagName(2),
    occurredOn: "2026-10-12",
    academicYear: 2026,
    hours: 2,
    description: "Designed the plantation drive poster set and the FCFS entry sheet.",
    eventId: 2,
    createdBy: roll(0),
    createdAt: "2026-10-13T11:40:00Z",
  },
  {
    id: 3,
    rollNumber: roll(2),
    typeId: 3,
    typeName: tagName(3),
    occurredOn: "2026-10-30",
    academicYear: 2026,
    hours: 2,
    description: "Edited the three-minute recap video of the afforestation drive.",
    eventId: null,
    createdBy: roll(0),
    createdAt: "2026-10-31T07:25:00Z",
  },
  {
    id: 4,
    rollNumber: roll(3),
    typeId: 4,
    typeName: tagName(4),
    occurredOn: "2026-10-02",
    academicYear: 2026,
    hours: 2,
    description: "Wrote the White Cane Day press note and the volunteer briefing.",
    eventId: 3,
    createdBy: roll(0),
    createdAt: "2026-10-03T05:15:00Z",
  },
  {
    id: 5,
    rollNumber: roll(4),
    typeId: 1,
    typeName: tagName(1),
    occurredOn: "2026-09-26",
    academicYear: 2026,
    hours: 1,
    description: "Shot the pediatric camp documentation photos for the project archive.",
    eventId: 4,
    createdBy: roll(8),
    createdAt: "2026-09-27T13:05:00Z",
  },
  {
    id: 6,
    rollNumber: roll(5),
    typeId: 5,
    typeName: tagName(5),
    occurredOn: "2026-07-15",
    academicYear: 2026,
    hours: 6,
    description: "Served as the project representative for the July to December term.",
    eventId: null,
    createdBy: roll(0),
    createdAt: "2026-07-16T09:00:00Z",
  },
  {
    id: 7,
    rollNumber: roll(6),
    typeId: 2,
    typeName: tagName(2),
    occurredOn: "2026-09-08",
    academicYear: 2026,
    hours: 2,
    description: "Designed the intergenerational festival invitation and standee layout.",
    eventId: 5,
    createdBy: roll(0),
    createdAt: "2026-09-09T10:35:00Z",
  },
  {
    id: 8,
    rollNumber: roll(7),
    typeId: 1,
    typeName: tagName(1),
    occurredOn: "2026-09-08",
    academicYear: 2026,
    hours: 1,
    description: "Photographed the old age care festival for the newsletter spread.",
    eventId: 5,
    createdBy: roll(0),
    createdAt: "2026-09-09T10:40:00Z",
  },
  {
    id: 9,
    rollNumber: roll(9),
    typeId: 4,
    typeName: tagName(4),
    occurredOn: "2026-08-21",
    academicYear: 2026,
    hours: 2,
    description: "Wrote the monsoon drive volunteer safety checklist and circular.",
    eventId: null,
    createdBy: roll(0),
    createdAt: "2026-08-22T08:10:00Z",
  },
  {
    id: 10,
    rollNumber: roll(10),
    typeId: 2,
    typeName: tagName(2),
    occurredOn: "2026-02-11",
    academicYear: 2025,
    hours: 2,
    description: "Designed the Republic Day participation certificate template.",
    eventId: null,
    createdBy: roll(0),
    createdAt: "2026-02-12T12:00:00Z",
  },
  {
    id: 11,
    rollNumber: roll(11),
    typeId: 1,
    typeName: tagName(1),
    occurredOn: "2026-01-24",
    academicYear: 2025,
    hours: 1,
    description: "Photographed the Republic Day contingent practice sessions.",
    eventId: null,
    createdBy: roll(0),
    createdAt: "2026-01-25T06:45:00Z",
  },
  {
    id: 12,
    rollNumber: roll(0),
    typeId: 5,
    typeName: tagName(5),
    occurredOn: "2025-08-01",
    academicYear: 2025,
    hours: 6,
    description: "Held the Tech Team post for the 2025-26 academic year.",
    eventId: null,
    createdBy: roll(12),
    createdAt: "2025-08-02T09:30:00Z",
  },
];

const round1 = (value: number) => Math.round(value * 10) / 10;

const adjustmentTotal = (rollNumber: string, academicYear: number) =>
  MOCK_HOURS_ADJUSTMENTS.filter(
    (adjustment) =>
      adjustment.rollNumber === rollNumber &&
      adjustment.academicYear === academicYear,
  ).reduce((sum, adjustment) => sum + adjustment.hours, 0);

/**
 * Two years per volunteer. 2025 carries imported legacy hours so the rollup
 * shows the three columns; 2026 is event + adjustments only.
 */
export const MOCK_VOLUNTEER_YEAR_HOURS: VolunteerYearHours[] = MOCK_VOLUNTEERS.flatMap(
  (volunteer) => {
    const currentAdjustments = adjustmentTotal(volunteer.rollNumber, 2026);
    const currentTotal = volunteer.allocatedHours;
    const previousTotal = round1(volunteer.allocatedHours * 0.45);
    const previousLegacy = round1(previousTotal * 0.3);

    return [
      {
        rollNumber: volunteer.rollNumber,
        academicYear: 2026,
        eventHours: round1(currentTotal - currentAdjustments),
        adjustmentHours: round1(currentAdjustments),
        legacyHours: 0,
        total: round1(currentTotal),
        computedAt: "2026-10-31T18:20:00Z",
      },
      {
        rollNumber: volunteer.rollNumber,
        academicYear: 2025,
        eventHours: round1(previousTotal - previousLegacy),
        adjustmentHours: 0,
        legacyHours: previousLegacy,
        total: previousTotal,
        computedAt: "2026-07-12T09:05:00Z",
      },
    ];
  },
);

export const MOCK_HOURS_RECOMPUTE: Record<number, HoursRecomputeState> = {
  2026: {
    academicYear: 2026,
    lastRecomputedAt: "2026-10-31T18:20:00Z",
    volunteers: MOCK_VOLUNTEERS.length,
  },
  2025: {
    academicYear: 2025,
    lastRecomputedAt: "2026-07-12T09:05:00Z",
    volunteers: MOCK_VOLUNTEERS.length,
  },
};

/** The category default for an event, looked up by name (event ids and category ids are independent). */
function categoryDefaultFor(name: string | null, categoryId: number | null): number {
  const byName = name
    ? MOCK_EVENT_CATEGORIES.find(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      )
    : undefined;
  if (byName) return byName.defaultHours;
  const byId = categoryId
    ? MOCK_EVENT_CATEGORIES.find((category) => category.id === categoryId)
    : undefined;
  return byId?.defaultHours ?? 4;
}

/**
 * Events as approval rows. Only COMPLETED, non-imported events of the year,
 * prefilled with the category default (11.9 step 1).
 */
export function getHoursApprovalRows(academicYear: number): HoursApprovalRow[] {
  return MOCK_EVENTS.filter(
    (event) =>
      event.status === "COMPLETED" &&
      event.academicYear === academicYear &&
      !event.isImported,
  )
    .map((event) => {
      const defaultHours = categoryDefaultFor(
        event.category?.name ?? null,
        event.category?.id ?? null,
      );
      const approved = event.hoursApproved && event.hours !== null;

      return {
        eventId: event.id,
        title: event.title,
        startsAt: event.startsAt,
        categoryId: event.category?.id ?? null,
        categoryName: event.category?.name ?? null,
        categoryDefaultHours: defaultHours,
        presentCount: event.presentCount ?? event.presentAttendees ?? 0,
        hours: event.hours,
        approved,
        approvedBy: approved ? "2105404" : null,
        approvedAt: approved ? "2026-10-12T10:00:00Z" : null,
      };
    })
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export function getEventCategories(): EventCategory[] {
  return MOCK_EVENT_CATEGORIES;
}

export function getAdjustmentTypes(): AdjustmentType[] {
  return MOCK_ADJUSTMENT_TYPES;
}

export function getHoursAdjustments(): HoursAdjustment[] {
  return MOCK_HOURS_ADJUSTMENTS;
}

export function getVolunteerYearHours(
  rollNumber: string,
  academicYear: number,
): VolunteerYearHours | undefined {
  return MOCK_VOLUNTEER_YEAR_HOURS.find(
    (row) => row.rollNumber === rollNumber && row.academicYear === academicYear,
  );
}

export function getHoursRecomputeState(academicYear: number): HoursRecomputeState {
  return (
    MOCK_HOURS_RECOMPUTE[academicYear] ?? {
      academicYear,
      lastRecomputedAt: null,
      volunteers: 0,
    }
  );
}
