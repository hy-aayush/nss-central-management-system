import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventForm } from "@/features/events/event-form";

export default function NewCentralEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 px-2 text-muted-foreground hover:text-foreground")}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Back to Events
        </Link>
      </div>

      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-blue-600 dark:text-blue-400 font-medium">
            <Globe2 className="size-3.5" />
            <span className="uppercase tracking-wider">Central Organization Event</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">All-Wing Quota Scheduler</span>
          </div>
        }
        title="Schedule Central Event"
        description="Configure university-wide NSS drives, blood donation camps, or orientation sessions with cross-wing slot distribution."
      />

      <EventForm mode="CENTRAL" />
    </div>
  );
}
