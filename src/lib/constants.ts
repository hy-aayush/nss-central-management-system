/**
 * System-wide constants, label dictionaries, and design token mappings.
 * Aligns with docs/SRS.md, docs/UI_SPECS.md, and docs/PERMISSIONS.md.
 */

import type { UserRole, UserStatus } from "@/types/auth";
import type { AttendanceStatus, EventStatus, EventType, MeetingType } from "@/types/event";
import type { Domain, ProjectName } from "@/types/project";
import type { VolunteerStatus } from "@/types/volunteer";

export const APP_CONFIG = {
  name: "NSS Central Management System",
  shortName: "NSS CMS",
  organization: "NSS SCE KIIT",
  timezone: "Asia/Kolkata",
  instituteDomain: "kiit.ac.in",
  version: "0.1.0",
} as const;

export const ROLE_DETAILS: Record<
  UserRole,
  { label: string; description: string; badgeVariant: "default" | "secondary" | "outline" }
> = {
  COORDINATOR: {
    label: "Coordinator",
    description: "Organization-wide operational oversight and approvals",
    badgeVariant: "default",
  },
  TECH_TEAM: {
    label: "Tech Team",
    description: "System administration, central event and attendance management",
    badgeVariant: "secondary",
  },
  BUILDER: {
    label: "Builder",
    description: "Central event logistics and operations planning",
    badgeVariant: "outline",
  },
  PROJECT_REPRESENTATIVE: {
    label: "Project Representative",
    description: "3rd-year volunteer leading assigned project events and volunteers",
    badgeVariant: "outline",
  },
};

export const USER_STATUS_DETAILS: Record<
  UserStatus,
  { label: string; badgeClass: string }
> = {
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-success/15 text-success border-success/30",
  },
  SUSPENDED: {
    label: "Suspended",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
  },
  REVOKED: {
    label: "Revoked",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export const VOLUNTEER_STATUS_DETAILS: Record<
  VolunteerStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-success/15 text-success border-success/30",
    dotClass: "bg-success",
  },
  SUSPENDED: {
    label: "Suspended",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    dotClass: "bg-destructive",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

export const EVENT_STATUS_DETAILS: Record<
  EventStatus,
  { label: string; badgeClass: string }
> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  SCHEDULED: {
    label: "Scheduled",
    badgeClass: "bg-info/15 text-info border-info/30",
  },
  PUBLISHED: {
    label: "Published",
    badgeClass: "bg-primary/15 text-primary border-primary/30",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
  },
  ONGOING: {
    label: "Ongoing",
    badgeClass: "bg-primary/20 text-primary border-primary/40 animate-pulse",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-success/15 text-success border-success/30",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CENTRAL: "Central Event",
  PROJECT: "Project Event",
};

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  CENTRAL: "Central Meeting",
  PROJECT: "Project Meeting",
  BUILDERS: "Builders Meeting",
};

export const ATTENDANCE_STATUS_DETAILS: Record<
  AttendanceStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  PRESENT: {
    label: "Present",
    badgeClass: "bg-success/15 text-success border-success/30",
    icon: "CheckCircle2",
  },
  ABSENT: {
    label: "Absent",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    icon: "XCircle",
  },
  EXCUSED: {
    label: "Excused",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
    icon: "AlertCircle",
  },
};

export const DOMAIN_DETAILS: Record<
  Domain,
  { label: string; icon: string; description: string }
> = {
  GENERAL_VOLUNTEERING: {
    label: "General Volunteering",
    icon: "Users",
    description: "Core field execution, event logistics, and crowd coordination",
  },
  PHOTOGRAPHY: {
    label: "Photography",
    icon: "Camera",
    description: "Event photojournalism, portrait sessions, and media archiving",
  },
  VIDEO_EDITING: {
    label: "Video Editing",
    icon: "Video",
    description: "After-movies, promotional reels, documentaries, and social clips",
  },
  GRAPHIC_DESIGNING: {
    label: "Graphic Designing",
    icon: "Palette",
    description: "Event banners, digital posters, identity badges, and certificates",
  },
  CONTENT_WRITING: {
    label: "Content Writing",
    icon: "PenTool",
    description: "Press releases, formal reports, social media copy, and notices",
  },
};

export const KIIT_SCHOOLS = [
  "School of Computer Engineering",
  "School of Electronics Engineering",
  "School of Mechanical Engineering",
  "School of Electrical Engineering",
  "School of Civil Engineering",
  "School of Applied Sciences",
  "School of Management",
  "School of Law",
  "School of Biotechnology",
] as const;

export const ACADEMIC_YEARS = ["2nd", "3rd", "4th"] as const;

export const PROJECT_COLOR_MAP: Record<ProjectName, { light: string; border: string }> = {
  Bandhutva: { light: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  Dhara: { light: "bg-teal-500/10 text-teal-600 dark:text-teal-400", border: "border-teal-500/30" },
  Nidaan: { light: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "border-rose-500/30" },
  Riddhi: { light: "bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  Swet: { light: "bg-sky-500/10 text-sky-600 dark:text-sky-400", border: "border-sky-500/30" },
  Sanyukt: { light: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/30" },
  Sparsh: { light: "bg-violet-500/10 text-violet-600 dark:text-violet-400", border: "border-violet-500/30" },
  Udaan: { light: "bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  Urja: { light: "bg-orange-500/10 text-orange-600 dark:text-orange-400", border: "border-orange-500/30" },
};
