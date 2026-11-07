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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { MonthlyTrendPoint } from "@/types/analytics";

interface MonthlyTrendsChartProps {
  trends: MonthlyTrendPoint[];
  className?: string;
}

const emptySubscribe = () => () => {};

export function MonthlyTrendsChart({
  trends,
  className,
}: MonthlyTrendsChartProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const formattedData = trends.map((t) => {
    const parts = t.month.split("-");
    const monthNum = parseInt(parts[1] || "1", 10);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const year = parts[0] ?? "";

    return {
      rawMonth: t.month,
      month: monthNames[monthNum - 1] || t.month,
      year,
      hours: t.hoursCompleted,
      turnoutRate: t.attendanceRate ?? 0,
      events: t.eventsCount,
      meetings: t.meetingsCount,
      volunteersPresent: t.volunteersPresent,
    };
  });

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Service hours and turnout
          </CardTitle>
          <CardDescription>
            Six-month trajectory of logged hours and verified participation
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-[0.625rem] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            Hours
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-chart-2"
            />
            Turnout
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {mounted ? (
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 8, right: 6, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="hoursGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeOpacity={0.55}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--color-border-strong)",
                    strokeDasharray: "3 3",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload;
                      return (
                        <div className="space-y-1.5 rounded-lg border border-border/70 bg-popover px-3 py-2 text-[0.6875rem] shadow-[var(--elevation-2)]">
                          <p className="font-medium text-foreground">
                            {label} {point.year}
                          </p>
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-muted-foreground">Hours</span>
                            <span className="tnum font-medium text-foreground">
                              {point.hours}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-muted-foreground">Turnout</span>
                            <span className="tnum font-medium text-foreground">
                              {point.turnoutRate}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-muted-foreground">
                              Events / meetings
                            </span>
                            <span className="tnum text-foreground">
                              {point.events} / {point.meetings}
                            </span>
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
                  activeDot={{
                    r: 3.5,
                    strokeWidth: 2,
                    stroke: "var(--card)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center sm:h-64">
            <span className="text-[0.75rem] text-muted-foreground">
              Loading trends…
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
