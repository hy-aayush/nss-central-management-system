"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users2 } from "lucide-react";
import type { GenderBreakdown } from "@/types/analytics";

interface GenderDonutChartProps {
  data: GenderBreakdown;
  className?: string;
}

const COLORS = {
  Male: "var(--color-chart-4)",
  Female: "var(--color-chart-3)",
  Other: "var(--color-chart-2)",
} as const;

const emptySubscribe = () => () => {};

export function GenderDonutChart({ data, className }: GenderDonutChartProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const chartData = [
    { name: "Male", value: data.male, percent: data.malePercent ?? 0 },
    { name: "Female", value: data.female, percent: data.femalePercent ?? 0 },
    ...(data.other > 0
      ? [
          {
            name: "Other",
            value: data.other,
            percent: data.otherPercent ?? 0,
          },
        ]
      : []),
  ];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <Users2 className="size-4 text-muted-foreground" aria-hidden="true" />
            Volunteer composition
          </CardTitle>
          <CardDescription>
            Gender distribution across active volunteers
          </CardDescription>
        </div>
        <span className="tnum shrink-0 rounded-md border border-border/60 bg-surface-container-low/60 px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
          {data.total} total
        </span>
      </CardHeader>

      <CardContent>
        {mounted ? (
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div className="relative size-40 shrink-0 sm:size-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/70 bg-popover px-2.5 py-1.5 text-[0.6875rem] shadow-[var(--elevation-2)]">
                            <span className="font-medium text-foreground">
                              {item.name}
                            </span>
                            <div className="tnum text-muted-foreground">
                              {item.value} volunteers · {item.percent}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={72}
                    paddingAngle={2}
                    cornerRadius={3}
                    strokeWidth={0}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum text-[1.375rem] leading-none font-semibold text-foreground">
                  {data.femalePercent ?? 0}%
                </span>
                <span className="mt-1 text-[0.5625rem] font-medium tracking-[0.07em] text-muted-foreground uppercase">
                  female
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-3">
              {chartData.map((entry) => (
                <div key={entry.name} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-[0.75rem]">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                      />
                      {entry.name}
                    </span>
                    <span className="tnum text-foreground">
                      <span className="font-medium">{entry.value}</span>{" "}
                      <span className="text-muted-foreground">
                        {entry.percent}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full origin-left rounded-full"
                      style={{
                        width: `${Math.min(entry.percent, 100)}%`,
                        backgroundColor: COLORS[entry.name as keyof typeof COLORS],
                      }}
                    />
                  </div>
                </div>
              ))}

              <p className="border-t border-border/50 pt-2.5 text-[0.625rem] leading-relaxed text-muted-foreground">
                Computed over active volunteers in the current academic cycle.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center">
            <div className="size-28 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
