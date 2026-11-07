import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  FolderKanban,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileCheck2,
  ShieldAlert,
  CalendarPlus,
  ArrowUpRight,
} from "lucide-react";

const SHORTCUTS = [
  {
    title: "Volunteer directory",
    description: "Search profiles and affiliations",
    href: "/volunteers",
    icon: Users,
  },
  {
    title: "Project wings",
    description: "Projects, PR leads and SDG goals",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Schedule event",
    description: "Create a central or project drive",
    href: "/events/central/new",
    icon: CalendarPlus,
  },
  {
    title: "Take attendance",
    description: "FCFS rosters and quick roll call",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Service hours",
    description: "Review and approve ledgers",
    href: "/hours",
    icon: Clock,
  },
  {
    title: "Internal requests",
    description: "Affiliations and role elevation",
    href: "/requests",
    icon: FileCheck2,
  },
  {
    title: "All events",
    description: "Browse historic and active drives",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Audit trail",
    description: "Compliance and sensitive actions",
    href: "/audit",
    icon: ShieldAlert,
  },
];

export function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Office shortcuts</CardTitle>
        <CardDescription>
          Direct access to the workflows that run the unit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-${item.title}`}
                href={item.href}
                className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-colors duration-200 hover:border-border/70 hover:bg-surface-container-low/60"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface-container-low/60 text-muted-foreground transition-colors group-hover:text-primary">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.75rem] font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="block truncate text-[0.625rem] text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <ArrowUpRight className="size-3 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
