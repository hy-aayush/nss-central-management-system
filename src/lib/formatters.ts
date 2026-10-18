/**
 * Formatting utilities for IST dates, durations, percentages, and labels.
 * Matches docs/SRS.md timezone requirements (Asia/Kolkata).
 */

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Format an ISO timestamp to human-readable IST date (e.g. "15 Oct 2026").
 */
export function formatDateIST(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Format an ISO timestamp to IST date with time (e.g. "15 Oct 2026, 04:30 PM").
 */
export function formatDateTimeIST(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Format an ISO timestamp to IST time only (e.g. "04:30 PM").
 */
export function formatTimeIST(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Format hours with suffix (e.g. 4 -> "4 hrs", 1 -> "1 hr").
 */
export function formatDurationHours(hours: number): string {
  if (typeof hours !== "number" || isNaN(hours)) return "0 hrs";
  return hours === 1 ? "1 hr" : `${hours} hrs`;
}

/**
 * Format attendance rate or decimal to percentage (e.g. 88.5 -> "88.5%").
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (typeof value !== "number" || isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Extract 1-2 uppercase initials from a person's name.
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncate a string cleanly with an ellipsis.
 */
export function truncate(text: string, maxLength: number = 60): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Format number with Indian numbering system comma grouping (e.g. 1,23,456).
 */
export function formatIndianNumber(value: number): string {
  if (typeof value !== "number" || isNaN(value)) return "0";
  return new Intl.NumberFormat("en-IN").format(value);
}
