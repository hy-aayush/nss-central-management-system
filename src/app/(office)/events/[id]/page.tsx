import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_EVENTS, getEventById, getEventParticipants } from "@/lib/mock-data";
import { EventDetailHero } from "@/features/events/event-detail-hero";
import { EventDetailTabs } from "@/features/events/event-detail-tabs";


export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    id: String(event.id),
  }));
}

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
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

  const participants = getEventParticipants(event.id);

  return (
    <div className="space-y-6">
      {/* Event Header Banner with Actions */}
      <EventDetailHero event={event} />

      {/* Tabs: Enrolled Roster, Project Slots, Turnout Summary, Governance */}
      <EventDetailTabs event={event} participants={participants} />
    </div>
  );
}
