import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { EventRecord, Meeting } from "@/types/event";
import { Calendar, MapPin, Users, ArrowRight, Plus } from "lucide-react";

interface UpcomingEventsCardProps {
  events: EventRecord[];
  meetings?: Meeting[];
  limit?: number;
}

export function UpcomingEventsCard({
  events,
  meetings = [],
  limit = 5,
}: UpcomingEventsCardProps) {
  const activeEvents = events
    .filter((e) =>
      ["SCHEDULED", "PUBLISHED", "RESCHEDULED", "ONGOING"].includes(e.status),
    )
    .map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      type: e.type === "CENTRAL" ? "Central" : "Project",
      date: e.startsAt,
      venue: e.venue,
      status: e.status,
      href: `/events/${e.id}`,
      expectedAttendees: e.expectedAttendees ?? e.registeredCount ?? 0,
    }));

  const activeMeetings = meetings
    .filter((m) => ["SCHEDULED", "ONGOING", "RESCHEDULED"].includes(m.status))
    .map((m) => ({
      id: `meeting-${m.id}`,
      title: m.agenda,
      type: "Meeting",
      date: `${m.date}T${m.startTime}:00+05:30`,
      venue: m.venue,
      status: m.status,
      href: `/meetings`,
      expectedAttendees: m.eligibleCount ?? 0,
    }));

  const upcomingItems = [...activeEvents, ...activeMeetings]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
            Upcoming operations
          </CardTitle>
          <CardDescription>
            Scheduled drives and coordination meetings, in IST
          </CardDescription>
        </div>
        <Link
          href="/events"
          className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          View all
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between">
        {upcomingItems.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nothing scheduled"
            description="There are no events or meetings in the upcoming cycle."
            action={
              <Link
                href="/events/central/new"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" />
                Schedule event
              </Link>
            }
            className="my-auto border-0 bg-transparent py-8"
          />
        ) : (
          <ul className="-mx-1 divide-y divide-border/50">
            {upcomingItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-surface-container-low/60"
                >
                  <div className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-border/60 bg-surface-container-low/50 py-1.5">
                    <span className="tnum text-[0.9375rem] leading-none font-semibold text-foreground">
                      {new Intl.DateTimeFormat("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                      }).format(new Date(item.date))}
                    </span>
                    <span className="mt-0.5 text-[0.5625rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                      {new Intl.DateTimeFormat("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                      }).format(new Date(item.date))}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="h-4 rounded px-1.5 text-[0.5625rem] font-medium tracking-wide uppercase"
                      >
                        {item.type}
                      </Badge>
                      <StatusBadge
                        status={item.status}
                        type="event"
                        showDot
                        className="h-4 border-0 px-1.5 py-0 text-[0.5625rem]"
                      />
                    </div>
                    <p className="truncate text-[0.8125rem] font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[0.6875rem] text-muted-foreground">
                      <span className="tnum inline-flex items-center gap-1">
                        {formatTimeIST(item.date)}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{item.venue}</span>
                      </span>
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-1 pt-1 text-[0.6875rem] text-muted-foreground sm:flex">
                    <Users className="size-3 text-muted-foreground/70" />
                    <span className="tnum">{item.expectedAttendees}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {upcomingItems.length > 0 ? (
          <p className="mt-3 border-t border-border/50 pt-2.5 text-[0.625rem] text-muted-foreground/70">
            Showing {upcomingItems.length} of{" "}
            {activeEvents.length + activeMeetings.length} scheduled ·{" "}
            {formatDateIST(new Date(upcomingItems[0].date))}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
