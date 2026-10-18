import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTimeIST } from "@/lib/time";
import type { AuditLogEntry } from "@/types/audit";
import { ShieldAlert, ArrowRight, History, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface RecentAuditCardProps {
  logs: AuditLogEntry[];
  limit?: number;
}

export function RecentAuditCard({ logs, limit = 5 }: RecentAuditCardProps) {
  const recentLogs = logs.slice(0, limit);

  return (
    <Card className="border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
            Security & Audit Activity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Immutable log of sensitive administrative actions and approvals
          </CardDescription>
        </div>
        <Link
          href="/audit"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground",
          })}
        >
          View Trail
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-1">
        {recentLogs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Recent Audit Entries"
            description="All sensitive actions and security events will be logged here."
            className="py-8 my-auto"
          />
        ) : (
          <div className="divide-y divide-border/50 -mx-2 px-2">
            {recentLogs.map((entry) => {
              const outcomeIcon =
                entry.outcome === "SUCCESS" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : entry.outcome === "FAILURE" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                );

              return (
                <div
                  key={entry.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5 transition-colors hover:bg-muted/30 p-2 rounded-lg text-xs"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {outcomeIcon}
                      <span className="font-semibold text-foreground">
                        {entry.actorName ?? entry.actorRoll ?? "System"}
                      </span>
                      {entry.effectiveRole && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          {entry.effectiveRole}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatDateTimeIST(entry.at || entry.timestamp || "")}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {entry.summary}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/80 font-mono">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-sans font-medium text-foreground">
                      {entry.action}
                    </span>
                    {entry.projectContext && (
                      <span>Project: {entry.projectContext}</span>
                    )}
                    {entry.reason && (
                      <span className="truncate italic">Reason: &quot;{entry.reason}&quot;</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
