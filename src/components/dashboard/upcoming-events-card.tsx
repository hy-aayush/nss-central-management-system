import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { EventRecord, Meeting } from "@/types/event";
import { Calendar, MapPin, Users, ArrowRight, Clock, Plus } from "lucide-react";

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
  // Filter for upcoming/scheduled/ongoing items
  const activeEvents = events
    .filter((e) => ["SCHEDULED", "PUBLISHED", "RESCHEDULED", "ONGOING"].includes(e.status))
    .map((e) => ({
      id: `event-${e.id}`,
      originalId: e.id,
      title: e.title,
      type: e.type === "CENTRAL" ? ("Central Event" as const) : ("Project Event" as const),
      badgeVariant: e.type === "CENTRAL" ? ("secondary" as const) : ("outline" as const),
      date: e.startsAt,
      venue: e.venue,
      status: e.status,
      href: `/events/${e.id}`,
      expectedAttendees: e.expectedAttendees ?? e.registeredCount ?? 0,
      isMeeting: false,
    }));

  const activeMeetings = meetings
    .filter((m) => ["SCHEDULED", "ONGOING", "RESCHEDULED"].includes(m.status))
    .map((m) => ({
      id: `meeting-${m.id}`,
      originalId: m.id,
      title: m.agenda,
      type: `${m.type} Meeting` as const,
      badgeVariant: "outline" as const,
      date: `${m.date}T${m.startTime}:00+05:30`,
      venue: m.venue,
      status: m.status,
      href: `/meetings`,
      expectedAttendees: m.eligibleCount ?? 0,
      isMeeting: true,
    }));

  // Combine and sort by date ascending
  const upcomingItems = [...activeEvents, ...activeMeetings]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  return (
    <Card className="border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            Upcoming Operations
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Scheduled events, drives and coordination meetings (IST)
          </CardDescription>
        </div>
        <Link
          href="/events"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground",
          })}
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-1">
        {upcomingItems.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Upcoming Events"
            description="There are currently no events or meetings scheduled for the upcoming cycle."
            action={
              <Link
                href="/events/central/new"
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1 text-xs" })}
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule Event
              </Link>
            }
            className="py-8 my-auto"
          />
        ) : (
          <div className="divide-y divide-border/50 -mx-2 px-2">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-muted/30 p-2 rounded-lg"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={item.badgeVariant} className="text-[10px] px-1.5 py-0 font-normal">
                      {item.type}
                    </Badge>
                    <StatusBadge status={item.status} type="event" showDot className="text-[10px] py-0 px-2" />
                  </div>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground/70" />
                      {formatDateIST(item.date)} at {formatTimeIST(item.date)}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="h-3 w-3 text-muted-foreground/70" />
                      {item.venue}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{item.expectedAttendees} expected</span>
                  </div>
                  <Link
                    href={item.href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-7 text-xs px-2.5 opacity-90 group-hover:opacity-100 group-hover:border-primary/50",
                    })}
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
