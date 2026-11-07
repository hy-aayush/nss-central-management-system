import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventForm } from "@/features/events/event-form";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function NewCentralEventPage() {
  await requireOfficeAccess();
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
          <PageEyebrow
            label="Central unit event"
            meta="Cross-wing quota scheduler"
          />
        }
        title="Schedule central event"
        description="Configure university-wide NSS drives, blood donation camps, or orientation sessions with cross-wing slot distribution."
      />

      <EventForm mode="CENTRAL" />
    </div>
  );
}
