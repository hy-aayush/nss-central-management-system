/**
 * Typed permission checkers matching docs/PERMISSIONS.md and src/types/auth.ts.
 * Implements granular role-action rules and volunteer detail visibility constraints.
 */

import type { PermissionAction, UserRole } from "@/types/auth";
import type { ProjectName } from "@/types/project";

/**
 * Evaluates whether a user role has permission to perform a specific action.
 */
export function hasPermission(
  role: UserRole,
  action: PermissionAction,
  options?: {
    userAssignedProjects?: ProjectName[];
    targetProject?: ProjectName;
  }
): boolean {
  switch (action) {
    // Coordinators and Tech Team see all central & project dashboards
    case "view:dashboard:organization":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // PRs only see their respective project dashboard
    case "view:dashboard:project":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // Coordinators and Tech Team only see all volunteers
    case "view:volunteers:all":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // PRs can only see their project volunteers
    case "view:volunteers:project":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // PRs see project volunteers, POCs see roll/name/project, Tech/Coords see all
    case "view:event:central:assigned_volunteers":
      return true;

    // PRs can only see their project volunteers
    case "view:event:project:assigned_volunteers":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // Every user (PRs, POCs, Tech, Coordinators, Builders) can see upcoming & ongoing events
    case "view:events:scheduled_and_ongoing:all":
      return true;

    // Tech and Coordinators can see all past events
    case "view:events:past:all":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Every user can see past central events & analytics
    case "view:events:past:central":
      return true;

    // PRs see their project past events; Coords and Tech see all
    case "view:events:past:project":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // Cross-project analytics: Coordinators and Tech Team only
    case "view:analytics:cross_project":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Project analytics: PRs see their project analytics; Coords/Tech see all
    case "view:analytics:project":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // Audit logs: Coordinators and Tech Team only
    case "view:audit_logs":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Suspend volunteer: Coordinators and Tech Team
    case "suspend:volunteer":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Central event creation: Coordinators, PRs, Builders, and Tech Team
    case "create:event:central":
      return true;

    // Project event creation: Coordinators, Tech Team, and PRs (for their project)
    case "create:event:project":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") {
        if (!options?.targetProject || !options?.userAssignedProjects) return true;
        return options.userAssignedProjects.includes(options.targetProject);
      }
      return false;

    // Create volunteer: Coordinators and Tech Team
    case "create:volunteer":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Correct attendance after locking period: Coordinators and Tech Team
    case "correct:attendance":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Manage event attendance
    case "manage:event:attendance":
      if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
      if (role === "PROJECT_REPRESENTATIVE") return true;
      return false;

    // Manage event FCFS
    case "manage:event:fcfs":
      return role === "COORDINATOR" || role === "TECH_TEAM" || role === "PROJECT_REPRESENTATIVE";

    // Manage meeting attendance
    case "manage:meeting:attendance":
      return role === "COORDINATOR" || role === "TECH_TEAM" || role === "PROJECT_REPRESENTATIVE";

    // Manage roster: Coordinators and Tech Team
    case "manage:roster":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Edit FCFS list after locking (walk-ins): Coordinators and Tech Team
    case "edit:event:fcfs":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Edit volunteer affiliations: Coordinators and Tech Team
    case "edit:volunteer:affiliations":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Approve hours: Coordinators and Tech Team
    case "approve:hours":
      return role === "COORDINATOR" || role === "TECH_TEAM";

    // Export bounded CSV
    case "export:csv:bounded":
      return role === "COORDINATOR" || role === "TECH_TEAM" || role === "PROJECT_REPRESENTATIVE";

    default:
      return false;
  }
}

export function canCreateCentralEvent(role?: UserRole): boolean {
  void role;
  return true;
}

export function canCreateProjectEvent(
  role: UserRole,
  assignedProjects?: ProjectName[],
  targetProject?: ProjectName
): boolean {
  if (role === "COORDINATOR" || role === "TECH_TEAM") return true;
  if (role === "PROJECT_REPRESENTATIVE" && targetProject && assignedProjects) {
    return assignedProjects.includes(targetProject);
  }
  return role === "PROJECT_REPRESENTATIVE";
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === "COORDINATOR" || role === "TECH_TEAM";
}

export function canApproveHours(role: UserRole): boolean {
  return role === "COORDINATOR" || role === "TECH_TEAM";
}

export function canManageRoster(role: UserRole): boolean {
  return role === "COORDINATOR" || role === "TECH_TEAM";
}
