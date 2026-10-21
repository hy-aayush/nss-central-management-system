"use client";

import { TrendingUp, CalendarDays, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonthlyTrendPoint } from "@/types/analytics";
import { academicYearLabel, formatMonthYearIST } from "@/lib/time";

interface AnalyticsMonthlyTrendsProps {
  trends: MonthlyTrendPoint[];
}

export function AnalyticsMonthlyTrends({ trends }: AnalyticsMonthlyTrendsProps) {
  const maxHours = Math.max(...trends.map((t) => t.hoursCompleted));
  // Academic year derived from the latest data point — deterministic at
  // prerender time (Cache Components forbids reading the clock, SRS 16.4).
  const latestMonthKey = trends[trends.length - 1]?.month;
  const academicYear = latestMonthKey
    ? academicYearLabel(`${latestMonthKey}-01`)
    : "";

  return (
    <Card className="p-6 bg-card border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4.5 text-primary" />
            Seasonal Participation &amp; Turnout Trends
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Monthly progression of drives, attendance rates, and verified service credit.
          </p>
        </div>
        <Badge variant="outline" className="text-label-xs bg-muted/40 self-start sm:self-auto">            Academic Year {academicYear}
          </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {trends.map((point) => {
          // IST month label via lib/time (SRS 2.6/11.1): en-IN + Asia/Kolkata,
          // deterministic on server and client (no host-timezone drift).
          const monthName = formatMonthYearIST(`${point.month}-01`);
          const hoursPercentage = Math.round((point.hoursCompleted / maxHours) * 100);

          return (
            <div
              key={point.month}
              className="p-4 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-label-sm text-foreground flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-primary" />
                  {monthName}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4.5 font-mono font-semibold ${
                    (point.attendanceRate ?? 0) >= 90
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  {(point.attendanceRate ?? 0).toFixed(1)}% Turnout
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-center bg-background/60 p-2 rounded-lg border border-border/40">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Events
                  </span>
                  <span className="font-mono font-semibold text-foreground text-label-sm">
                    {point.eventsCount}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Meets
                  </span>
                  <span className="font-mono font-semibold text-foreground text-label-sm">
                    {point.meetingsCount}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Present
                  </span>
                  <span className="font-mono font-semibold text-foreground text-label-sm">
                    {point.volunteersPresent}
                  </span>
                </div>
              </div>

              {/* Hours meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-label-xs">
                  <span className="text-muted-foreground">Hours Delivered</span>
                  <span className="font-mono font-semibold text-foreground">
                    {point.hoursCompleted} hrs
                  </span>
                </div>
                <div className="w-full bg-muted/70 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${hoursPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-label-xs text-muted-foreground flex items-center gap-2">
        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          August 2026 recorded the highest community drive volume with 1,150 hours delivered and 92.4% verified volunteer attendance.
        </span>
      </div>
    </Card>
  );
}
