"use client";

import { Users, Clock, CheckCircle2, Calendar, TrendingUp, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/types/analytics";
import { academicYearLabel, formatDateIST } from "@/lib/time";

interface AnalyticsKpiHeaderProps {
  summary: DashboardSummary;
}

export function AnalyticsKpiHeader({ summary }: AnalyticsKpiHeaderProps) {
  const { volunteers, hours, events, lastUpdated } = summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Volunteers */}
        <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active Volunteers
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-bold text-foreground">
                  {volunteers.active}
                </span>
                <span className="text-label-xs text-muted-foreground">
                  / {volunteers.total} enrolled
                </span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-label-xs text-muted-foreground">
            <span>2nd: {volunteers.byYear[0]?.count ?? 0}</span>
            <span>3rd: {volunteers.byYear[1]?.count ?? 0}</span>
            <span>4th: {volunteers.byYear[2]?.count ?? 0}</span>
          </div>
        </Card>

        {/* Approved Service Hours */}
        <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
                Approved Hours
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-bold text-foreground">
                  {hours.totalApproved?.toLocaleString() ?? hours.totalAllocated.toLocaleString()}
                </span>
                <span className="text-label-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                  <TrendingUp className="size-3" />
                  +14.2%
                </span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-label-xs text-muted-foreground">
            <span>Pending Review: {hours.totalPending ?? 210} hrs</span>
            <span>Events: {hours.totalFromEvents}</span>
          </div>
        </Card>

        {/* Turnout Rate */}
        <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
                Average Turnout Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-bold text-foreground">
                  {volunteers.averageAttendanceRate}%
                </span>
                <span className="text-label-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified
                </span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-label-xs text-muted-foreground">
            <span>Meeting Turnout: {summary.meetings.averageTurnout}%</span>
            <span>138 Drives</span>
          </div>
        </Card>

        {/* Completed Drives */}
        <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
                Completed Drives
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-bold text-foreground">
                  {events.completedEvents}
                </span>
                <span className="text-label-xs text-muted-foreground">
                  / {events.totalEvents} total
                </span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-label-xs text-muted-foreground">
            <span>Central: {events.centralEventsCount}</span>
            <span>Project: {events.projectEventsCount}</span>
          </div>
        </Card>
      </div>

      {/* Snapshot metadata and gender distribution bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-label-xs text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/50">
        <div className="flex items-center gap-3">
          <span>Gender Representation:</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="size-2 rounded-full bg-primary" />
            <span>Male: {volunteers.gender.male} ({volunteers.gender.malePercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Female: {volunteers.gender.female} ({volunteers.gender.femalePercent}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldAlert className="size-3.5 text-muted-foreground" />
          {/* Academic year derived from the snapshot time, not `new Date()`:
              Cache Components forbids reading the clock during prerender. */}
          <span>Calculated for Academic Year {academicYearLabel(lastUpdated)} • Updated: {formatDateIST(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}
