import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { VolunteerStatsBar } from "@/features/volunteers/volunteer-stats-bar";
import { VolunteerTable } from "@/features/volunteers/volunteer-table";
import { getVolunteers, getDashboardSummary } from "@/lib/mock-data";
import { Download, UserPlus } from "lucide-react";

export const metadata = {
  title: "Volunteer Directory | NSS Central Management System",
  description: "Internal office volunteer directory with search, project filtering, academic year tracking, and service hours.",
};

export default async function VolunteersPage() {
  const { items: allVolunteers } = getVolunteers();
  const summary = getDashboardSummary();

  const total = summary.volunteers.total;
  const active = summary.volunteers.active;
  const year2Count = summary.volunteers.byYear.find((y) => y.year === 2)?.count ?? 130;
  const year3Count = summary.volunteers.byYear.find((y) => y.year === 3)?.count ?? 128;
  const year4Count = summary.volunteers.byYear.find((y) => y.year === 4)?.count ?? 126;
  const domainCount = allVolunteers.filter((v) => v.domains.length > 0).length;
  const avgAttendance = summary.volunteers.averageAttendanceRate;

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Office Roster</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">NSS Central Unit</span>
          </div>
        }
        title="Volunteer Directory"
        description="Search and audit student volunteer records, project wing affiliations, creative domain designations, and service attendance."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/requests"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-xs font-medium",
              })}
            >
              <Download className="size-3.5" />
              Export Roster
            </Link>
            <Link
              href="/requests"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "gap-1.5 text-xs font-medium",
              })}
            >
              <UserPlus className="size-3.5" />
              Add Volunteer
            </Link>
          </div>
        }
      />

      {/* Summary KPI Bar */}
      <VolunteerStatsBar
        total={total}
        active={active}
        year2Count={year2Count}
        year3Count={year3Count}
        year4Count={year4Count}
        domainCount={domainCount}
        avgAttendance={avgAttendance ?? 90.4}
      />

      {/* Interactive Table with Filters and Pagination */}
      <React.Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-28 rounded-xl border border-border/70 bg-card/60 animate-pulse" />
            <div className="h-96 rounded-xl border border-border/70 bg-card/60 animate-pulse" />
          </div>
        }
      >
        <VolunteerTable initialVolunteers={allVolunteers} />
      </React.Suspense>
    </div>
  );
}
