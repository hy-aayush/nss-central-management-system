import React from "react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { PanelSkeleton } from "@/components/shared/route-skeleton";
import { getAnalyticsSnapshot } from "@/lib/mock-data/cached";
import { AnalyticsView } from "@/features/analytics/analytics-view";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

/**
 * Charts are the expensive part of this screen and the last thing a reader can
 * act on. The title block streams first, then the analytics panel fills in, so
 * the page never looks like it failed to load.
 */
async function AnalyticsPanels() {
  const { summary } = await getAnalyticsSnapshot();
  return <AnalyticsView summary={summary} />;
}

export default async function AnalyticsPage() {
  await requireOfficeAccess();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="Office intelligence"
            meta="Analytics and metrics"
          />
        }
        title="Institutional analytics"
        description="Cross-project volunteer turnout, seasonal participation trends, and domain specialisation coverage."
      />

      <React.Suspense
        fallback={<PanelSkeleton label="Aggregating performance analytics…" rows={5} />}
      >
        <AnalyticsPanels />
      </React.Suspense>
    </div>
  );
}
