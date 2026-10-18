"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { MonthlyTrendPoint } from "@/types/analytics";

interface MonthlyTrendsChartProps {
  trends: MonthlyTrendPoint[];
  className?: string;
}

const emptySubscribe = () => () => {};
 
export function MonthlyTrendsChart({ trends, className }: MonthlyTrendsChartProps) {
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const formattedData = trends.map((t) => {
    // Format YYYY-MM to Short Month name
    const parts = t.month.split("-");
    const monthNum = parseInt(parts[1] || "1", 10);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabel = monthNames[monthNum - 1] || t.month;

    return {
      rawMonth: t.month,
      month: monthLabel,
      hours: t.hoursCompleted,
      turnoutRate: t.attendanceRate ?? 0,
      events: t.eventsCount,
      meetings: t.meetingsCount,
      volunteersPresent: t.volunteersPresent,
    };
  });

  return (
    <Card className={`border border-border/70 bg-card/75 backdrop-blur-sm ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="space-y-0.5">
            <CardTitle className="text-title-sm font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              Service Hours &amp; Activity Trends
            </CardTitle>
            <CardDescription className="text-body-xs text-muted-foreground">
              6-month service hours logged and event turnout trajectories
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-body-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Hours Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Turnout %</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mounted ? (
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label} 2026</p>
                          <div className="flex items-center justify-between gap-4 text-primary font-medium">
                            <span>Hours Logged:</span>
                            <span className="font-mono font-bold">{data.hours} hrs</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
                            <span>Turnout Rate:</span>
                            <span className="font-mono font-bold">{data.turnoutRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-muted-foreground">
                            <span>Events / Meetings:</span>
                            <span className="font-mono">{data.events} / {data.meetings}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hoursGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 sm:h-64 flex items-center justify-center">
            <span className="text-body-xs text-muted-foreground">Loading trend visualizations...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
