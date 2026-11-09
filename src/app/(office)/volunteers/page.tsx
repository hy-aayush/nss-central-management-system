import * as React from "react";
import Link from "next/link";
import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { VolunteerStatsBar } from "@/features/volunteers/volunteer-stats-bar";
import { VolunteerTable } from "@/features/volunteers/volunteer-table";
import { getVolunteersSnapshot } from "@/lib/mock-data/cached";
import { Inbox, UserPlus } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

/** The directory must be request-bound: it is gated on every navigation. */
export const instant = false;

export const metadata = {
  title: "Volunteer Directory",
  description:
    "Internal office volunteer directory with search, project filtering, academic year tracking, and service hours.",
};

export default async function VolunteersPage() {
  await requireOfficeAccess();
  const { volunteers: allVolunteers, summary } = await getVolunteersSnapshot();

  const total = summary.volunteers.total;
  const active = summary.volunteers.active;
  const year2Count =
    summary.volunteers.byYear.find((y) => y.year === 2)?.count ?? 130;
  const year3Count =
    summary.volunteers.byYear.find((y) => y.year === 3)?.count ?? 128;
  const year4Count =
    summary.volunteers.byYear.find((y) => y.year === 4)?.count ?? 126;
  const domainCount = allVolunteers.filter((v) => v.domains.length > 0).length;
  const avgAttendance = summary.volunteers.averageAttendanceRate;

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow label="Office roster" meta="NSS Central Unit" />
        }
        title="Volunteer directory"
        description="Search and audit student volunteer records, project wing affiliations, creative domain designations, and service attendance."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/requests"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <Inbox className="size-3.5" />
              Roster requests
            </Link>
            <Link
              href="/requests"
              className={buttonVariants({
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <UserPlus className="size-3.5" />
              Request addition
            </Link>
          </div>
        }
      />

      <VolunteerStatsBar
        total={total}
        active={active}
        year2Count={year2Count}
        year3Count={year3Count}
        year4Count={year4Count}
        domainCount={domainCount}
        avgAttendance={avgAttendance ?? 90.4}
      />

      <React.Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-border/70 bg-card/60" />
            <div className="h-96 animate-pulse rounded-2xl border border-border/70 bg-card/60" />
          </div>
        }
      >
        <VolunteerTable initialVolunteers={allVolunteers} />
      </React.Suspense>
    </div>
  );
}
