import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { getDashboardSummary } from "@/lib/mock-data";
import { AnalyticsView } from "@/features/analytics/analytics-view";

export default function AnalyticsPage() {
  const summary = getDashboardSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Office Intelligence</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Analytics &amp; Metrics</span>
          </div>
        }
        title="Institutional Analytics &amp; Reporting"
        description="Cross-project volunteer turnout rates, seasonal drive participation trends, and domain specializations."
      />

      <React.Suspense fallback={<LoadingState message="Aggregating performance analytics..." />}>
        <AnalyticsView summary={summary} />
      </React.Suspense>
    </div>
  );
}

