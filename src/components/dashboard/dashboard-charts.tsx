"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeferredChart } from "./deferred-chart";

/**
 * On-demand chart loading (SRS 16.6).
 *
 * Recharts adds ~116 KB gzipped to a route bundle. Wrapping the charts in a
 * client component with `ssr: false` keeps that chunk out of the initial page
 * load entirely: the server (and the static prerender) emits the card-shaped
 * skeleton below, and the browser fetches the chart code after hydration.
 *
 * Plain `next/dynamic` inside the Server Component page was measured and does
 * NOT achieve this under Cache Components/PPR — the statically prerendered
 * shell still hydrates the chart module eagerly (424 KB gz initial). Recorded
 * in docs/DECISIONS.md.
 *
 * The wrapper below also gates the fetch on the card approaching the viewport
 * (`DeferredChart`), so the heaviest chunk in the app downloads when it can
 * actually be seen instead of during hydration.
 */

function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`border border-border/70 bg-card/75 ${className || ""}`}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  );
}

const GenderDonutChart = dynamic(
  () =>
    import("@/components/dashboard/gender-donut-chart").then((m) => ({
      default: m.GenderDonutChart,
    })),
  { ssr: false, loading: () => <ChartCardSkeleton className="h-full" /> },
);

const MonthlyTrendsChart = dynamic(
  () =>
    import("@/components/dashboard/monthly-trends-chart").then((m) => ({
      default: m.MonthlyTrendsChart,
    })),
  { ssr: false, loading: () => <ChartCardSkeleton className="h-full" /> },
);

export function LazyGenderDonutChart(
  props: React.ComponentProps<typeof GenderDonutChart>,
) {
  return (
    <DeferredChart
      className="h-full"
      placeholder={<ChartCardSkeleton className="h-full" />}
    >
      <GenderDonutChart {...props} />
    </DeferredChart>
  );
}

export function LazyMonthlyTrendsChart(
  props: React.ComponentProps<typeof MonthlyTrendsChart>,
) {
  return (
    <DeferredChart
      className="h-full"
      placeholder={<ChartCardSkeleton className="h-full" />}
    >
      <MonthlyTrendsChart {...props} />
    </DeferredChart>
  );
}
