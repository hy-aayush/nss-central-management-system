import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    title: "Volunteer Directory",
    description: "Search 384 student profiles & affiliations",
    href: "/volunteers",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    title: "Project Wings",
    description: "View 9 projects, PR leads & SDG goals",
    href: "/projects",
    icon: FolderKanban,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    title: "Schedule Event",
    description: "Create central or project volunteer drives",
    href: "/events/central/new",
    icon: CalendarPlus,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 group-hover:bg-purple-500/20",
  },
  {
    title: "Take Attendance",
    description: "FCFS rosters & quick roll-call marking",
    href: "/attendance",
    icon: ClipboardCheck,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 group-hover:bg-amber-500/20",
  },
  {
    title: "Service Hours",
    description: "Review & approve monthly hours ledgers",
    href: "/hours",
    icon: Clock,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 group-hover:bg-sky-500/20",
  },
  {
    title: "Internal Requests",
    description: "Affiliations, role elevation & exemptions",
    href: "/requests",
    icon: FileCheck2,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
  },
  {
    title: "All Events & Calendar",
    description: "Browse historical, active & scheduled drives",
    href: "/events",
    icon: CalendarDays,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10 group-hover:bg-pink-500/20",
  },
  {
    title: "Audit Trail",
    description: "Review compliance & sensitive records log",
    href: "/audit",
    icon: ShieldAlert,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 group-hover:bg-rose-500/20",
  },
];

export function QuickActionsCard() {
  return (
    <Card className="border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Office Shortcuts & Operations
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Direct navigation to core NSS Central administrative management workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all duration-150"
              >
                <div
                  className={`p-2 rounded-md shrink-0 transition-colors ${item.bg} ${item.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
