import React from "react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { getAnalyticsSnapshot } from "@/lib/mock-data/cached";
import { AnalyticsView } from "@/features/analytics/analytics-view";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function AnalyticsPage() {
  await requireOfficeAccess();
  const { summary } = await getAnalyticsSnapshot();

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
        fallback={<LoadingState message="Aggregating performance analytics…" />}
      >
        <AnalyticsView summary={summary} />
      </React.Suspense>
    </div>
  );
}
