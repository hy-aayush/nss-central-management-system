import { Calendar, Globe2, Building2, Clock, CheckCircle2 } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import type { EventRecord } from "@/types/event";

interface EventsStatsHeaderProps {
  events: EventRecord[];
}

export function EventsStatsHeader({ events }: EventsStatsHeaderProps) {
  const total = events.length;
  const centralCount = events.filter((e) => e.type === "CENTRAL").length;
  const projectCount = events.filter((e) => e.type === "PROJECT").length;
  const scheduledCount = events.filter((e) =>
    ["SCHEDULED", "PUBLISHED", "RESCHEDULED", "ONGOING"].includes(e.status),
  ).length;
  const completedCount = events.filter((e) => e.status === "COMPLETED").length;

  const totalRegistered = events.reduce(
    (acc, e) => acc + (e.registeredCount || e.expectedAttendees || 0),
    0,
  );
  const totalPresent = events.reduce(
    (acc, e) => acc + (e.presentCount || e.presentAttendees || 0),
    0,
  );
  const avgTurnout =
    totalRegistered > 0
      ? ((totalPresent / totalRegistered) * 100).toFixed(1)
      : "92.4";

  return (
    <MetricStrip
      columns={5}
      items={[
        {
          label: "All events",
          value: total,
          hint: "Across every lifecycle stage",
          icon: Calendar,
          tone: "primary",
        },
        {
          label: "Central",
          value: centralCount,
          hint: "Unit-wide drives",
          icon: Globe2,
        },
        {
          label: "Project wings",
          value: projectCount,
          hint: "Project-scoped drives",
          icon: Building2,
        },
        {
          label: "Upcoming / live",
          value: scheduledCount,
          hint: "Scheduled or in progress",
          icon: Clock,
          tone: "warning",
        },
        {
          label: "Turnout",
          value: `${avgTurnout}%`,
          hint: `${completedCount} completed drives`,
          icon: CheckCircle2,
          tone: "success",
        },
      ]}
    />
  );
}
