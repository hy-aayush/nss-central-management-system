"use client";

import { ShieldAlert, AlertTriangle, Users, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AuditLogEntry } from "@/types/audit";

interface AuditStatsHeaderProps {
  logs: AuditLogEntry[];
}

export function AuditStatsHeader({ logs }: AuditStatsHeaderProps) {
  const total = logs.length;
  const emergencyCount = logs.filter(
    (l) =>
      l.action === "EMERGENCY_ACCESS_GRANT" ||
      l.action === "EMERGENCY_ACCESS_REVOKE" ||
      l.reason?.toLowerCase().includes("emergency")
  ).length;
  const deniedCount = logs.filter((l) => l.outcome === "DENIED").length;
  const uniqueActors = new Set(logs.map((l) => l.actorRoll).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Mutations */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Audit Ledger Records
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {total}
              </span>
              <span className="text-label-xs text-muted-foreground">
                Immutable Entries
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <History className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          SRS §13 permanent retention log
        </p>
      </Card>

      {/* Emergency Delegations */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-amber-500/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
              Emergency Actions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {emergencyCount}
              </span>
              <span className="text-label-xs text-amber-600 dark:text-amber-400 font-medium">
                Packs (Max 24h)
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Auto-deprovisioning on expiration
        </p>
      </Card>

      {/* Denied Security Events */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-rose-500/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Security Blocks
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {deniedCount}
              </span>
              <span className="text-label-xs text-rose-600 dark:text-rose-400 font-medium">
                Denied Attempts
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Unauthorized role grant intercepted
        </p>
      </Card>

      {/* Operating Staff Officers */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Operating Officers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {uniqueActors}
              </span>
              <span className="text-label-xs text-muted-foreground">
                Active in period
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Coordinator, Tech &amp; PR mutations
        </p>
      </Card>
    </div>
  );
}
