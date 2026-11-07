"use client";

import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import type { DashboardSummary } from "@/types/analytics";
import { academicYearLabel, formatDateIST } from "@/lib/time";

interface AnalyticsKpiHeaderProps {
  summary: DashboardSummary;
}

export function AnalyticsKpiHeader({ summary }: AnalyticsKpiHeaderProps) {
  const { volunteers, hours, events, lastUpdated } = summary;

  return (
    <div className="space-y-3">
      <MetricStrip
        columns={4}
        items={[
          {
            label: "Active volunteers",
            value: volunteers.active,
            hint: `of ${volunteers.total} enrolled`,
            icon: Users,
            tone: "primary",
          },
          {
            label: "Approved hours",
            value: (
              hours.totalApproved ?? hours.totalAllocated
            ).toLocaleString("en-IN"),
            hint: `${hours.totalPending ?? 210} hours pending review`,
            icon: Clock,
            tone: "success",
          },
          {
            label: "Average turnout",
            value: `${volunteers.averageAttendanceRate}%`,
            hint: `Meeting turnout ${summary.meetings.averageTurnout}%`,
            icon: CheckCircle2,
          },
          {
            label: "Completed drives",
            value: events.completedEvents,
            hint: `${events.centralEventsCount} central · ${events.projectEventsCount} project`,
            icon: Calendar,
          },
        ]}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="size-3 text-success" aria-hidden="true" />
                <span className="text-foreground">Services hours trending up</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-chart-4"
                />
                Male {volunteers.gender.male} ({volunteers.gender.malePercent}%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-chart-3"
                />
                Female {volunteers.gender.female} (
                {volunteers.gender.femalePercent}%)
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="size-3" aria-hidden="true" />
              Academic year {academicYearLabel(lastUpdated)} · updated{" "}
              {formatDateIST(lastUpdated)}
            </span>
          </div>
        }
      />
    </div>
  );
}
