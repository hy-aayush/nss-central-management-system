import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { SettingsView } from "@/features/settings/settings-view";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">System Preferences</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Internal Controls (SRS §3.2)</span>
          </div>
        }
        title="Workspace Configuration &amp; Policies"
        description="Operational guardrails, soft-rule policies (S-01 to S-09), Supabase free-tier limits, and emergency circuit breaker simulations."
      />

      <React.Suspense fallback={<LoadingState message="Loading system settings..." />}>
        <SettingsView />
      </React.Suspense>
    </div>
  );
}

