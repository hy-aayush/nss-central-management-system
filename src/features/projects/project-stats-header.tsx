import * as React from "react";
import { FolderKanban, Users, Clock, CalendarCheck } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";

interface ProjectStatsHeaderProps {
  projectCount: number;
  totalVolunteers: number;
  totalHours: number;
  totalEvents: number;
}

export function ProjectStatsHeader({
  projectCount,
  totalVolunteers,
  totalHours,
  totalEvents,
}: ProjectStatsHeaderProps) {
  return (
    <MetricStrip
      columns={4}
      items={[
        {
          label: "Active wings",
          value: projectCount,
          hint: "SDG-aligned projects",
          icon: FolderKanban,
          tone: "primary",
        },
        {
          label: "Deployed volunteers",
          value: totalVolunteers.toLocaleString("en-IN"),
          hint: "Assigned across wings",
          icon: Users,
        },
        {
          label: "Service hours",
          value: totalHours.toLocaleString("en-IN"),
          hint: "Logged this academic year",
          icon: Clock,
        },
        {
          label: "Community drives",
          value: totalEvents,
          hint: "Completed and scheduled",
          icon: CalendarCheck,
        },
      ]}
    />
  );
}
