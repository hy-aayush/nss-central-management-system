/**
 * Pure time, calendar, and timezone utilities for NSS Central Management System.
 * Enforces IST (Asia/Kolkata, UTC+05:30) and Indian format conventions (en-IN).
 * Matches docs/SRS.md Sections 2.6, 11.1 and Appendix C.
 */

import { ACADEMIC_YEAR_START_MONTH, LOCALE, TZ } from "@/config/app";

/**
 * Returns current Date in UTC.
 */
export function nowUTC(): Date {
  return new Date();
}

/**
 * Parses an ISO string or Date safely.
 */
export function parseInstant(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

/**
 * Formats a Date/ISO string to IST date (e.g. "18 Oct 2026").
 */
export function formatDateIST(input: string | Date): string {
  try {
    const d = parseInstant(input);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TZ,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Formats a Date/ISO string to IST time (e.g. "6:30 pm").
 */
export function formatTimeIST(input: string | Date): string {
  try {
    const d = parseInstant(input);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d).toLowerCase();
  } catch {
    return "—";
  }
}

/**
 * Formats a Date/ISO string to IST datetime (e.g. "18 Oct 2026, 6:30 pm").
 */
export function formatDateTimeIST(input: string | Date): string {
  try {
    const d = parseInstant(input);
    if (isNaN(d.getTime())) return "—";
    return `${formatDateIST(d)}, ${formatTimeIST(d)}`;
  } catch {
    return "—";
  }
}

/**
 * Extracts the IST calendar date parts [year, month, day] for a given instant.
 * Month is 1-indexed (1 = Jan, 12 = Dec).
 */
export function getISTDateParts(input: string | Date = new Date()): { year: number; month: number; day: number } {
  const d = parseInstant(input);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(d);
  let year = 2026;
  let month = 1;
  let day = 1;
  for (const part of parts) {
    if (part.type === "year") year = Number(part.value);
    if (part.type === "month") month = Number(part.value);
    if (part.type === "day") day = Number(part.value);
  }
  return { year, month, day };
}

/**
 * Returns the academic year start (1 July IST).
 * E.g. in Oct 2026 -> 2026 (for 2026-2027 academic year).
 * In May 2026 -> 2025 (for 2025-2026 academic year).
 */
export function academicYearStart(input: string | Date = new Date()): number {
  const { year, month } = getISTDateParts(input);
  return month >= ACADEMIC_YEAR_START_MONTH ? year : year - 1;
}

/**
 * Computes a volunteer's academic standing year based on their admission batchYear:
 * year = academicYearStart(now) - batchYear + 1
 * E.g. batchYear 2024 in Oct 2026: 2026 - 2024 + 1 = 3 (3rd year).
 */
export function volunteerYear(batchYear: number, input: string | Date = new Date()): number {
  return academicYearStart(input) - batchYear + 1;
}

/**
 * Human-readable academic-year label for UI display, e.g. "2026–27".
 * Use this instead of hardcoding the year anywhere in the interface.
 */
export function academicYearLabel(input: string | Date = new Date()): string {
  const start = academicYearStart(input);
  return `${start}\u2013${String(start + 1).slice(-2)}`;
}

/**
 * Formats a "YYYY-MM" key (or any date) as an IST month label,
 * e.g. "January 2026". Deterministic on server and client: always formatted
 * in Asia/Kolkata with the en-IN locale, so it never depends on the host
 * time zone (SRS 2.6 and 11.1).
 */
export function formatMonthYearIST(input: string | Date): string {
  try {
    const d = parseInstant(input);
    if (isNaN(d.getTime())) return "\u2014";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TZ,
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "\u2014";
  }
}

/**
 * Computes midnight IST at the start of the NEXT IST day after the given instant.
 * Locks use this: locks apply when now() >= lockAt.
 * IST is UTC+05:30. Midnight IST next day = (next IST day 00:00:00 IST) in UTC.
 */
export function startOfNextDayIST(input: string | Date): string {
  const { year, month, day } = getISTDateParts(input);
  // Next day at 00:00:00 IST is equivalent to (day + 1) 00:00:00 GMT+0530
  // In UTC that is: year, month-1, day+1, minus 5h 30m
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  // Subtract 5 hours and 30 minutes to get UTC instant for 00:00:00 IST
  const utcInstant = new Date(nextDay.getTime() - (5 * 60 + 30) * 60 * 1000);
  return utcInstant.toISOString();
}

/**
 * Determines whether the current time is within or past the attendance opening lead window
 * (startsAt - 15 minutes).
 */
export function isAttendanceWindowOpen(startsAt: string | Date, now: string | Date = new Date()): boolean {
  const startMs = parseInstant(startsAt).getTime();
  const nowMs = parseInstant(now).getTime();
  const openMs = startMs - 15 * 60 * 1000;
  return nowMs >= openMs;
}
