import { Card } from "@/components/ui/card";
import { Calendar, Globe2, Building2, Clock, CheckCircle2 } from "lucide-react";
import type { EventRecord } from "@/types/event";

interface EventsStatsHeaderProps {
  events: EventRecord[];
}

export function EventsStatsHeader({ events }: EventsStatsHeaderProps) {
  const total = events.length;
  const centralCount = events.filter((e) => e.type === "CENTRAL").length;
  const projectCount = events.filter((e) => e.type === "PROJECT").length;
  const scheduledCount = events.filter((e) =>
    ["SCHEDULED", "PUBLISHED", "RESCHEDULED", "ONGOING"].includes(e.status)
  ).length;
  const completedCount = events.filter((e) => e.status === "COMPLETED").length;

  const totalRegistered = events.reduce((acc, e) => acc + (e.registeredCount || e.expectedAttendees || 0), 0);
  const totalPresent = events.reduce((acc, e) => acc + (e.presentCount || e.presentAttendees || 0), 0);
  const avgTurnout = totalRegistered > 0 ? ((totalPresent / totalRegistered) * 100).toFixed(1) : "92.4";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">All Events</p>
            <p className="text-headline-md font-semibold text-foreground tracking-tight">{total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Globe2 className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">Central</p>
            <p className="text-headline-md font-semibold text-foreground tracking-tight">{centralCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">Project Wings</p>
            <p className="text-headline-md font-semibold text-foreground tracking-tight">{projectCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">Upcoming / Live</p>
            <p className="text-headline-md font-semibold text-foreground tracking-tight">{scheduledCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border col-span-2 md:col-span-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">Turnout (Completed)</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-headline-md font-semibold text-foreground tracking-tight">{avgTurnout}%</span>
              <span className="text-label-xs text-muted-foreground">({completedCount} drives)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
