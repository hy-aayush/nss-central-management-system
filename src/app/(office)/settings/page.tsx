import React from "react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { SettingsView } from "@/features/settings/settings-view";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function SettingsPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="System preferences"
            meta="Internal controls · SRS §3.2"
          />
        }
        title="Workspace configuration and policies"
        description="Operational guardrails, soft-rule policies (S-01 to S-09), free-tier limits, and emergency circuit breaker behaviour."
      />

      <React.Suspense
        fallback={<LoadingState message="Loading system settings…" />}
      >
        <SettingsView />
      </React.Suspense>
    </div>
  );
}
