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
  badgeVariant?: "default" | "secondary" | "accent" | "success" | "warning" | "destructive" | "info" | "outline";
  description?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Executive summaries & live operational metrics",
  },
  {
    title: "Volunteers",
    href: "/volunteers",
    icon: Users,
    badge: "950",
    badgeVariant: "accent",
    description: "Volunteer records, domains, and participation history",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    badge: "9",
    badgeVariant: "outline",
    description: "Assigned projects and creative domains",
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    description: "Central and project event lifecycles",
  },
  {
    title: "Meetings",
    href: "/meetings",
    icon: CalendarCheck,
    description: "Project, central, and builders meetings with MOM",
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: UserCheck,
    description: "Marking sessions, corrections, and exceptions",
  },
  {
    title: "Hours",
    href: "/hours",
    icon: Clock,
    description: "Event approval, tags, manual hours, and recompute",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Turnout rates, hours distribution, and trends",
  },
  {
    title: "Requests",
    href: "/requests",
    icon: Inbox,
    badge: "3",
    badgeVariant: "warning",
    description: "Two-man rule volunteer suspension, archival, and delete requests",
  },
  {
    title: "Audit Logs",
    href: "/audit",
    icon: ScrollText,
    badge: "Live",
    badgeVariant: "outline",
    description: "Immutable application-level audit history",
  },
  {
    title: "Team & Access",
    href: "/team",
    icon: ShieldCheck,
    description: "Roster approvals and administrative assignments",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SlidersHorizontal,
    description: "Office configurations and personal preferences",
  },
];

export const OFFICE_NAV_CONFIG: NavSection[] = [
  {
    title: "Workspace",
    items: MAIN_NAV_ITEMS,
  },
];

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
    const matchedItem = MAIN_NAV_ITEMS.find((item) => item.href === currentPath) ??
      (currentPath === "/audit-logs" ? MAIN_NAV_ITEMS.find((item) => item.href === "/audit") : undefined);
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
  // Decode URL and format kebab-case or dynamic params
  const decoded = decodeURIComponent(str);
  if (decoded.startsWith("[") && decoded.endsWith("]")) {
    return decoded.slice(1, -1);
  }
  return decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
