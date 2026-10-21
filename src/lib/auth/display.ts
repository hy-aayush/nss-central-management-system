import type { ActiveAssignment } from "./gate";

/**
 * Display-only helpers for the office shell.
 *
 * These never participate in authorization. The role label is chosen from the
 * highest post for the avatar menu, using the SRS 4.3 rank order, and is shown
 * only to the signed-in person themselves.
 */

function tierOf(assignment: ActiveAssignment): number {
  switch (assignment.role) {
    case "COORDINATOR":
      return 5;
    case "TECH_TEAM":
      return assignment.techKind === "MENTOR" ? 4 : 3;
    case "PROJECT_REPRESENTATIVE":
      return 2;
    case "BUILDER":
      return assignment.builderKind === "POC" ? 2 : 1;
    default:
      return 0;
  }
}

/** Highest post label, e.g. "Coordinator" or "Tech Mentor". */
export function primaryRoleLabel(assignments: readonly ActiveAssignment[]): string {
  const top = [...assignments].sort((a, b) => tierOf(b) - tierOf(a))[0];

  if (!top) {
    return "Office staff";
  }

  switch (top.role) {
    case "COORDINATOR":
      return "Coordinator";
    case "TECH_TEAM":
      return top.techKind === "MENTOR" ? "Tech Mentor" : "Tech Member";
    case "PROJECT_REPRESENTATIVE":
      return "Project Representative";
    case "BUILDER":
      switch (top.builderKind) {
        case "POC":
          return "Point of Contact";
        case "DOMAIN_LEAD":
          return "Domain Lead";
        default:
          return "Builder";
      }
    default:
      return "Office staff";
  }
}

/** Up to two initials from a name; falls back to the roll number. */
export function initialsFromName(name: string, rollNumber: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0 && part !== "SYSTEM");

  if (parts.length === 0) {
    return rollNumber.slice(0, 2).toUpperCase();
  }

  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";

  return `${first}${last}`.toUpperCase() || rollNumber.slice(0, 2).toUpperCase();
}
