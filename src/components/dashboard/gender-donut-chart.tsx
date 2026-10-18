"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users2 } from "lucide-react";
import type { GenderBreakdown } from "@/types/analytics";

interface GenderDonutChartProps {
  data: GenderBreakdown;
  className?: string;
}

const COLORS = {
  Male: "#3b82f6",     // Blue 500
  Female: "#ec4899",   // Pink 500
  Other: "#8b5cf6",    // Purple 500
};

const emptySubscribe = () => () => {};

export function GenderDonutChart({ data, className }: GenderDonutChartProps) {
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const chartData = [
    { name: "Male", value: data.male, percent: data.malePercent ?? 0 },
    { name: "Female", value: data.female, percent: data.femalePercent ?? 0 },
    ...(data.other > 0 ? [{ name: "Other", value: data.other, percent: data.otherPercent ?? 0 }] : []),
  ];

  return (
    <Card className={`border border-border/70 bg-card/75 backdrop-blur-sm ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-title-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users2 className="size-4 text-primary" />
              Volunteer Gender Ratio
            </CardTitle>
            <CardDescription className="text-body-xs text-muted-foreground">
              Institutional diversity distribution across active volunteers
            </CardDescription>
          </div>
          <span className="text-label-sm font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {data.total} Total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {mounted ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative size-44 sm:size-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border px-2.5 py-1.5 rounded-lg shadow-md text-xs">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <div className="text-muted-foreground font-mono">
                              {item.value} volunteers ({item.percent}%)
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
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[entry.name as keyof typeof COLORS] || "#64748b"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total / Primary percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-headline-sm font-bold font-mono text-foreground">
                  {data.femalePercent}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Female Ratio
                </span>
              </div>
            </div>

            {/* Diversity Breakdown Legend */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-body-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-blue-500" />
                    <span className="text-foreground">Male Volunteers</span>
                  </div>
                  <span className="font-mono text-foreground font-semibold">
                    {data.male} <span className="text-muted-foreground font-normal">({data.malePercent}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${data.malePercent || 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-body-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-pink-500" />
                    <span className="text-foreground">Female Volunteers</span>
                  </div>
                  <span className="font-mono text-foreground font-semibold">
                    {data.female} <span className="text-muted-foreground font-normal">({data.femalePercent}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${data.femalePercent || 0}%` }}
                  />
                </div>
              </div>

              {data.other > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-body-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-purple-500" />
                      <span className="text-foreground">Other</span>
                    </div>
                    <span className="font-mono text-foreground font-semibold">
                      {data.other} <span className="text-muted-foreground font-normal">({data.otherPercent}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${data.otherPercent || 0}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                Balanced distribution aligns with institutional inclusivity guidelines.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center">
            <div className="size-32 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
