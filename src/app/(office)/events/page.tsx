import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";

export default function EventsPage() {
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
        title="Events"
        description="Centralized organization events, project work sessions, and lifecycle state management."
        actions={
          <Button size="sm">
            <Plus className="size-3.5 mr-1.5" />
            New Event
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <Calendar className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Events Calendar &amp; Rosters</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Event lifecycle transitions, attendance limits, and scheduling workflows will be implemented in the Events phase.
        </p>
      </Card>
    </div>
  );
}
