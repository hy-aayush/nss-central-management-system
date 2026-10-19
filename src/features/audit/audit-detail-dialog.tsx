"use client";

import { ShieldAlert, Clock, User, Globe, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { AuditLogEntry } from "@/types/audit";

interface AuditDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLogEntry | null;
}

export function AuditDetailDialog({ open, onOpenChange, entry }: AuditDetailDialogProps) {
  if (!entry) return null;

  const isEmergency =
    entry.action === "EMERGENCY_ACCESS_GRANT" ||
    entry.action === "EMERGENCY_ACCESS_REVOKE" ||
    entry.reason?.toLowerCase().includes("emergency");

  const isDenied = entry.outcome === "DENIED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isDenied
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300"
                  : isEmergency
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 font-semibold"
                  : "bg-primary/10 text-primary border-primary/20"
              }
            >
              {isEmergency ? "EMERGENCY ACTION" : entry.action}
            </Badge>

            <Badge
              variant="outline"
              className={
                isDenied
                  ? "bg-rose-500/10 text-rose-600 border-rose-300"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-300"
              }
            >
              {entry.outcome}
            </Badge>

            {entry.projectContext && (
              <Badge variant="outline" className="text-muted-foreground">
                Wing: {entry.projectContext}
              </Badge>
            )}
          </div>

          <DialogTitle className="text-headline-sm font-semibold text-foreground">
            Audit Ledger Entry #{entry.id}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            {entry.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-body-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/50 text-label-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="size-3" /> Actor Identity
              </span>
              <p className="font-medium text-foreground font-mono">
                {entry.actorName || "Unverified Actor"} ({entry.actorRoll || "No Roll"})
              </p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Role: {entry.effectiveRole || "UNKNOWN"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" /> Timestamp (IST)
              </span>
              <p className="font-medium text-foreground">
                {formatDateIST(entry.at)}, {formatTimeIST(entry.at)}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                ISO: {entry.at}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Hash className="size-3" /> Target Entity
              </span>
              <p className="font-medium text-foreground">
                {entry.entityType}: {entry.entityLabel || entry.entityId}
              </p>
              {entry.targetRoll && (
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Target Roll: {entry.targetRoll}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Globe className="size-3" /> Origin IP &amp; Trace
              </span>
              <p className="font-mono text-foreground">{entry.clientIp || "127.0.0.1"}</p>
              <span className="text-[10px] text-muted-foreground font-mono truncate block" title={entry.correlationId}>
                Trace: {entry.correlationId}
              </span>
            </div>
          </div>

          {/* Policy Justification Reason */}
          {entry.reason && (
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Audited Policy Justification Reason:
              </span>
              <p className="text-label-sm italic text-foreground leading-relaxed">
                &ldquo;{entry.reason}&rdquo;
              </p>
            </div>
          )}

          {/* Before / After Changes Diffs */}
          {entry.changes && Object.keys(entry.changes).length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Field-Level Mutation Snapshot (JSON Diff):
              </span>
              <div className="p-3 rounded-xl bg-muted/40 border border-border font-mono text-label-xs text-foreground overflow-x-auto">
                <pre>{JSON.stringify(entry.changes, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Emergency Pack Notice */}
          {isEmergency && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-300/40 text-amber-800 dark:text-amber-200 text-label-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Emergency Scope Governance (SRS §4.9)</span>
              </div>
              <p className="leading-relaxed">
                Emergency access packs are constrained to a single operational task and automatically expire within 24 hours. They never grant full organizational governance or raw database bypass.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
