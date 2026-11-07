import React from "react";
import Link from "next/link";
import { Building2, Globe2 } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { getEvents } from "@/lib/mock-data";
import { EventsStatsHeader } from "@/features/events/events-stats-header";
import { EventsTable } from "@/features/events/events-table";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function EventsPage() {
  await requireOfficeAccess();
  const { items: events } = getEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="Event scheduling"
            meta="Lifecycle management"
          />
        }
        title="Events and outreach drives"
        description="Centralised unit events, project work sessions, FCFS quota enforcement, and lifecycle state management."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/events/project/new"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <Building2 className="size-3.5" />
              Project event
            </Link>
            <Link
              href="/events/central/new"
              className={buttonVariants({ size: "sm", className: "gap-1.5" })}
            >
              <Globe2 className="size-3.5" />
              Central event
            </Link>
          </div>
        }
      />

      <EventsStatsHeader events={events} />

      <React.Suspense
        fallback={<LoadingState message="Loading events schedule…" />}
      >
        <EventsTable initialEvents={events} />
      </React.Suspense>
    </div>
  );
}
