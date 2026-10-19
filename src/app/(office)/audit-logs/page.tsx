import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { getAuditLogs } from "@/lib/mock-data";
import { AuditStatsHeader } from "@/features/audit/audit-stats-header";
import { AuditTable } from "@/features/audit/audit-table";

export default function AuditLogsPage() {
  const { items: logs } = getAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Accountability</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Immutable Ledger (SRS §13)</span>
          </div>
        }
        title="Audit Logs &amp; Security Ledger"
        description="Append-only record of volunteer profile edits, FCFS entries, attendance corrections, role changes, and emergency access grants."
      />

      {/* KPI Stats Bar */}
      <AuditStatsHeader logs={logs} />

      {/* Filterable Table */}
      <React.Suspense fallback={<LoadingState message="Streaming security audit logs..." />}>
        <AuditTable initialLogs={logs} />
      </React.Suspense>
    </div>
  );
}

