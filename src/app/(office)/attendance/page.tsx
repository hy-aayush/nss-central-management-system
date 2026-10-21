import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/loading-state";
import { getEvents } from "@/lib/mock-data";
import { AttendanceManager } from "@/features/attendance/attendance-manager";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function AttendancePage() {
  await requireOfficeAccess();
  const { items: events } = getEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Attendance Register</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Present / Absent / Excused</span>
          </div>
        }
        title="Attendance &amp; Roll Call"
        description="Verify event participation, take live roll calls, enforce lock deadlines, and apply audited attendance corrections."
        actions={
          <Link
            href="/events"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8.5 text-label-xs")}
          >
            <Calendar className="size-3.5 mr-1.5" />
            View Scheduled Events
          </Link>
        }
      />

      <React.Suspense fallback={<LoadingState message="Loading attendance register and participants..." />}>
        <AttendanceManager events={events} />
      </React.Suspense>
    </div>
  );
}
