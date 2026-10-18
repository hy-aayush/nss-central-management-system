"use client";

import { History, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { AttendanceCorrection } from "@/types/event";

interface AttendanceHistoryPanelProps {
  corrections: AttendanceCorrection[];
}

export function AttendanceHistoryPanel({ corrections }: AttendanceHistoryPanelProps) {
  return (
    <Card className="p-6 bg-card border-border space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="size-4.5 text-primary" />
          <h3 className="text-headline-sm font-semibold text-foreground">
            Attendance Corrections &amp; Audit Trail ({corrections.length})
          </h3>
        </div>
        <span className="text-label-xs text-muted-foreground">Immutable Ledger</span>
      </div>

      {corrections.length === 0 ? (
        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/70 space-y-2">
          <ShieldCheck className="size-8 text-muted-foreground/40 mx-auto" />
          <p className="text-body-sm font-medium text-foreground">No Attendance Corrections</p>
          <p className="text-label-xs text-muted-foreground max-w-sm mx-auto">
            All marked records reflect initial verified roll-call entries without manual post-lock modifications.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors space-y-2 text-body-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-label-sm font-semibold text-foreground">
                    Roll: {item.rollNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-label-xs">
                    <Badge variant="outline" className="px-1.5 py-0 h-4.5 text-[10px]">
                      {item.oldStatus}
                    </Badge>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className={`px-1.5 py-0 h-4.5 text-[10px] font-semibold ${
                        item.newStatus === "PRESENT"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                          : item.newStatus === "EXCUSED"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300"
                      }`}
                    >
                      {item.newStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-label-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>
                    {formatDateIST(item.correctedAt)}, {formatTimeIST(item.correctedAt)}
                  </span>
                </div>
              </div>

              <div className="text-label-sm text-foreground bg-background/80 p-2.5 rounded-lg border border-border/40">
                <p className="text-muted-foreground text-label-xs font-medium uppercase tracking-wider mb-0.5">
                  Audit Justification Reason:
                </p>
                <p className="italic text-foreground">&ldquo;{item.reason}&rdquo;</p>
              </div>

              <div className="text-label-xs text-muted-foreground">
                Corrected By Officer: <span className="font-mono font-medium text-foreground">{item.correctedBy}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
