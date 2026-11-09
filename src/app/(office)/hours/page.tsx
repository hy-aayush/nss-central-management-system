import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { getHoursSnapshot } from "@/lib/mock-data/cached";
import { HoursView } from "@/features/hours/hours-view";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function HoursPage() {
  await requireOfficeAccess();

  // One cached payload for both years: the ledger is synthetic and identical
  // for every member, so the request only pays for the access gate. The current
  // academic year is derived inside that cached payload (see cached.ts).
  const {
    currentYear,
    years,
    approvalRowsByYear,
    recomputeByYear,
    adjustments,
    tags,
    rollups,
    volunteers,
    events,
    volunteerCount,
  } = await getHoursSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={<PageEyebrow label="Service accounting" meta="Hours management" />}
        title="Service hours and adjustments"
        description="Approve event hours from category defaults, add tagged extra work, keep the adjustment ledger, and recompute the yearly totals volunteers see."
        actions={
          <Link
            href="/events?status=COMPLETED"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5",
            })}
          >
            <Calendar className="size-3.5" />
            Completed events
          </Link>
        }
      />

      <React.Suspense fallback={<LoadingState message="Loading the hours ledger…" />}>
        <HoursView
          approvalRowsByYear={approvalRowsByYear}
          recomputeByYear={recomputeByYear}
          adjustments={adjustments}
          tags={tags}
          rollups={rollups}
          volunteers={volunteers}
          events={events}
          years={years}
          defaultYear={currentYear}
          volunteerCount={volunteerCount}
        />
      </React.Suspense>
    </div>
  );
}
