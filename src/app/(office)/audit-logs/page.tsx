import React from "react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { getAuditSnapshot } from "@/lib/mock-data/cached";
import { AuditStatsHeader } from "@/features/audit/audit-stats-header";
import { AuditTable } from "@/features/audit/audit-table";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function AuditLogsPage() {
  await requireOfficeAccess();
  const { logs } = await getAuditSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="Accountability"
            meta="Immutable ledger · SRS §13"
          />
        }
        title="Audit logs and security ledger"
        description="Append-only record of volunteer profile edits, FCFS entries, attendance corrections, role changes, and emergency access grants."
      />

      <AuditStatsHeader logs={logs} />

      <React.Suspense
        fallback={<LoadingState message="Streaming security audit logs…" />}
      >
        <AuditTable initialLogs={logs} />
      </React.Suspense>
    </div>
  );
}
