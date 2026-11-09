import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { getEventSnapshot } from "@/lib/mock-data/cached";
import { EventDetailHero } from "@/features/events/event-detail-hero";
import { EventDetailTabs } from "@/features/events/event-detail-tabs";
import { requireOfficeAccess } from "@/lib/auth/actor";


export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    id: String(event.id),
  }));
}

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function EventDetailPage({ params }: EventPageProps) {
  await requireOfficeAccess();
  const { id } = await params;
  // Cached per event id (SRS 16.6): the roster and totals do not change for a
  // viewer, so a repeat visit costs one gate query and a cache read.
  const snapshot = await getEventSnapshot(id);

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <Link href="/events" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Events Directory
        </Link>
        <EmptyState
          icon={Calendar}
          title="Event Record Not Found"
          description={`No scheduled or archived event matches ID "${id}". It may have been archived or deleted.`}
          action={
            <Link href="/events" className={cn(buttonVariants({ size: "sm" }))}>
              Return to Events Directory
            </Link>
          }
        />
      </div>
    );
  }

  const { event, participants } = snapshot;

  return (
    <div className="space-y-6">
      {/* Event Header Banner with Actions */}
      <EventDetailHero event={event} />

      {/* Tabs: Enrolled Roster, Project Slots, Turnout Summary, Governance */}
      <EventDetailTabs event={event} participants={participants} />
    </div>
  );
}
