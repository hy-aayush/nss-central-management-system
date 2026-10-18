/**
 * Hours, categories, event groups, and adjustments types for NSS Central Management System.
 * Matches docs/SRS.md Sections 8.5, 10.5 and Appendix A.2, A.3.
 */

export interface EventCategory {
  id: number;
  name: string;
  defaultHours: number;
  isActive: boolean;
}

export interface EventGroup {
  id: number;
  title: string;
  description: string;
  academicYear: number;
  fullHours: number | null;              // hours awarded when minEventsForFull is met
  minEventsForFull: number | null;
  eventIds: number[];
}

/** A tag made by Tech/Coordinators, with preset hours, so everyone is treated the same. */
export interface AdjustmentType {
  id: number;
  name: string;
  defaultHours: number;
  isActive: boolean;
}

export interface HoursAdjustment {
  id: number;
  rollNumber: string;
  typeId: number;
  typeName: string;
  occurredOn: string;                    // IST day
  academicYear: number;
  hours: number;
  description: string;
  eventId: number | null;
  createdBy: string;
  createdAt: string;
}

export interface VolunteerYearHours {
  rollNumber: string;
  academicYear: number;
  eventHours: number;
  adjustmentHours: number;
  legacyHours: number;
  total: number;                         // event + adjustment + legacy
  computedAt: string;
}
