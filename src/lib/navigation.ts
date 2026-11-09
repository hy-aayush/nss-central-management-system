import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Calendar,
  CalendarCheck,
  UserCheck,
  Clock,
  BarChart3,
  Inbox,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "outline";
  /** Keyword shown in the command menu and used for search matching. */
  description?: string;
  /** Extra terms that should match this destination in the command menu. */
  keywords?: string[];
  /**
   * Set to `false` for destinations that are rarely opened (reports and admin
   * screens). Their links then wait for a real click instead of speculatively
   * fetching a private RSC payload, which on this app also means an access-gate
   * database query and a serverless invocation per prefetch.
   */
  prefetch?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * Navigation is grouped by mental model rather than by data table: what you
 * look at first, the records you maintain, the operations you run, the
 * insight you derive, and the administration of the workspace.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Executive summaries & live operational metrics",
        keywords: ["home", "overview", "metrics", "kpi"],
      },
    ],
  },
  {
    title: "Records",
    items: [
      {
        title: "Volunteers",
        href: "/volunteers",
        icon: Users,
        badge: "950",
        badgeVariant: "outline",
        description: "Volunteer records, domains, and participation history",
        keywords: ["roster", "students", "directory"],
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
        prefetch: false,
        badge: "9",
        badgeVariant: "outline",
        description: "Assigned projects and creative domains",
        keywords: ["wings", "sdg", "programmes"],
      },
      {
        title: "Events",
        href: "/events",
        icon: Calendar,
        description: "Central and project event lifecycles",
        keywords: ["drives", "sessions", "schedule"],
      },
      {
        title: "Meetings",
        href: "/meetings",
        icon: CalendarCheck,
        description: "Project, central, and builders meetings with MOM",
        keywords: ["minutes", "mom", "governance"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Attendance",
        href: "/attendance",
        icon: UserCheck,
        description: "Marking sessions, corrections, and exceptions",
        keywords: ["present", "absent", "roll call"],
      },
      {
        title: "Hours",
        href: "/hours",
        icon: Clock,
        description: "Event approval, tags, manual hours, and recompute",
        keywords: ["service", "credits", "approval"],
      },
      {
        title: "Requests",
        href: "/requests",
        icon: Inbox,
        prefetch: false,
        badge: "3",
        badgeVariant: "warning",
        description: "Two-man rule suspension, archival, and delete requests",
        keywords: ["approvals", "queue", "two-man"],
      },
    ],
  },
  {
    title: "Insight",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        prefetch: false,
        description: "Turnout rates, hours distribution, and trends",
        keywords: ["charts", "reports", "trends"],
      },
      {
        title: "Audit Logs",
        href: "/audit",
        icon: ScrollText,
        prefetch: false,
        badge: "Live",
        badgeVariant: "outline",
        description: "Immutable application-level audit history",
        keywords: ["security", "trail", "history"],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Team & Access",
        href: "/team",
        icon: ShieldCheck,
        prefetch: false,
        description: "Roster approvals and administrative assignments",
        keywords: ["permissions", "roles", "staff"],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: SlidersHorizontal,
        prefetch: false,
        description: "Office configurations and personal preferences",
        keywords: ["preferences", "config", "theme"],
      },
    ],
  },
];

/** Flat list kept for breadcrumbs, search and any legacy consumer. */
export const MAIN_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

/** Legacy export retained for existing imports. */
export const OFFICE_NAV_CONFIG: NavSection[] = NAV_SECTIONS;

export interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrent: boolean;
}

/**
 * Derives breadcrumbs hierarchy from the current route pathname.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Workspace", href: "/dashboard", isCurrent: true }];
  }

  const breadcrumbs: BreadcrumbSegment[] = [
    { label: "NSS Central", href: "/dashboard", isCurrent: false },
  ];

  let currentPath = "";
  segments.forEach((seg, index) => {
    currentPath += `/${seg}`;
    const isCurrent = index === segments.length - 1;

    // Match known navigation labels (handle /audit vs /audit-logs)
    const matchedItem =
      MAIN_NAV_ITEMS.find((item) => item.href === currentPath) ??
      (currentPath === "/audit-logs"
        ? MAIN_NAV_ITEMS.find((item) => item.href === "/audit")
        : undefined);
    const label = matchedItem ? matchedItem.title : formatSegmentLabel(seg);

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent,
    });
  });

  return breadcrumbs;
}

function formatSegmentLabel(str: string): string {
  const decoded = decodeURIComponent(str);
  if (decoded.startsWith("[") && decoded.endsWith("]")) {
    return decoded.slice(1, -1);
  }
  return decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
