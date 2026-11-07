import * as React from "react";
import { Users, GraduationCap, Award, Palette } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";

interface VolunteerStatsBarProps {
  total: number;
  active: number;
  year2Count: number;
  year3Count: number;
  year4Count: number;
  domainCount: number;
  avgAttendance: number;
}

export function VolunteerStatsBar({
  total,
  active,
  year2Count,
  year3Count,
  year4Count,
  domainCount,
  avgAttendance,
}: VolunteerStatsBarProps) {
  return (
    <MetricStrip
      columns={4}
      items={[
        {
          label: "Active volunteers",
          value: active.toLocaleString("en-IN"),
          hint: `of ${total.toLocaleString("en-IN")} enrolled`,
          icon: Users,
          tone: "primary",
        },
        {
          label: "Year distribution",
          value: (
            <span className="flex items-baseline gap-1.5">
              <span>{year2Count}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{year3Count}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{year4Count}</span>
            </span>
          ),
          hint: "2nd · 3rd · 4th year",
          icon: GraduationCap,
        },
        {
          label: "Domain specialists",
          value: domainCount.toLocaleString("en-IN"),
          hint: "Across four creative wings",
          icon: Palette,
        },
        {
          label: "Average turnout",
          value: `${avgAttendance}%`,
          hint: "Verified across completed drives",
          icon: Award,
          tone: "success",
        },
      ]}
    />
  );
}
