import React from "react";
import Link from "next/link";
import { Globe2, Building2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/loading-state";
import { getEvents } from "@/lib/mock-data";
import { EventsStatsHeader } from "@/features/events/events-stats-header";
import { EventsTable } from "@/features/events/events-table";

export default function EventsPage() {
  const { items: events } = getEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Event Scheduling</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Lifecycle Management</span>
          </div>
        }
        title="Events &amp; Outreach Drives"
        description="Centralized organization events, project work sessions, FCFS quota enforcement, and lifecycle state management."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/events/project/new"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8.5 text-label-xs")}
            >
              <Building2 className="size-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              Schedule Project Event
            </Link>
            <Link
              href="/events/central/new"
              className={cn(buttonVariants({ size: "sm" }), "h-8.5 text-label-xs shadow-xs")}
            >
              <Globe2 className="size-3.5 mr-1.5" />
              Create Central Event
            </Link>
          </div>
        }
      />

      {/* Metric Cards Header */}
      <EventsStatsHeader events={events} />

      {/* Filterable Table View wrapped in Suspense for PPR / useSearchParams */}
      <React.Suspense fallback={<LoadingState message="Loading events schedule..." />}>
        <EventsTable initialEvents={events} />
      </React.Suspense>
    </div>
  );
}
