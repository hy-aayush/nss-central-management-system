import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventForm } from "@/features/events/event-form";

export default function NewProjectEventPage() {
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
          <div className="flex items-center gap-1.5 text-label-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <Building2 className="size-3.5" />
            <span className="uppercase tracking-wider">Project Wing Outreach Drive</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">SDG-Aligned Session</span>
          </div>
        }
        title="Schedule Project Event"
        description="Schedule a specialized outreach drive for your wing with automatic eligibility for host members and optional collaboration slots."
      />

      <EventForm mode="PROJECT" />
    </div>
  );
}
