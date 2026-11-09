import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { getAttendanceSnapshot } from "@/lib/mock-data/cached";
import { AttendanceManager } from "@/features/attendance/attendance-manager";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function AttendancePage() {
  await requireOfficeAccess();
  const { events } = await getAttendanceSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="Attendance register"
            meta="Present / absent / excused"
          />
        }
        title="Attendance and roll call"
        description="Verify event participation, take live roll calls, enforce lock deadlines, and apply audited attendance corrections."
        actions={
          <Link
            href="/events"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5",
            })}
          >
            <Calendar className="size-3.5" />
            Scheduled events
          </Link>
        }
      />

      <React.Suspense
        fallback={
          <LoadingState message="Loading attendance register and participants…" />
        }
      >
        <AttendanceManager events={events} />
      </React.Suspense>
    </div>
  );
}
