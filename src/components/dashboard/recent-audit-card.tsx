import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTimeIST } from "@/lib/time";
import type { AuditLogEntry } from "@/types/audit";
import {
  ShieldAlert,
  ArrowRight,
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface RecentAuditCardProps {
  logs: AuditLogEntry[];
  limit?: number;
}

export function RecentAuditCard({ logs, limit = 5 }: RecentAuditCardProps) {
  const recentLogs = logs.slice(0, limit);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Audit activity
          </CardTitle>
          <CardDescription>
            Immutable record of sensitive administrative actions
          </CardDescription>
        </div>
        <Link
          href="/audit"
          className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          View trail
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {recentLogs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No audit entries"
            description="Sensitive actions and security events will be recorded here."
            className="my-auto border-0 bg-transparent py-8"
          />
        ) : (
          <ul className="-mx-1 divide-y divide-border/50">
            {recentLogs.map((entry) => {
              const OutcomeIcon =
                entry.outcome === "SUCCESS"
                  ? CheckCircle2
                  : entry.outcome === "FAILURE"
                    ? AlertTriangle
                    : XCircle;
              const outcomeClass =
                entry.outcome === "SUCCESS"
                  ? "text-success"
                  : entry.outcome === "FAILURE"
                    ? "text-warning"
                    : "text-destructive";

              return (
                <li
                  key={entry.id}
                  className="space-y-1.5 rounded-lg px-1 py-2.5 transition-colors hover:bg-surface-container-low/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <OutcomeIcon
                        className={`size-3.5 shrink-0 ${outcomeClass}`}
                        aria-hidden="true"
                      />
                      <span className="truncate text-[0.75rem] font-medium text-foreground">
                        {entry.actorName ?? entry.actorRoll ?? "System"}
                      </span>
                      {entry.effectiveRole ? (
                        <Badge
                          variant="outline"
                          className="hidden h-4 shrink-0 rounded px-1.5 text-[0.5625rem] font-normal sm:inline-flex"
                        >
                          {entry.effectiveRole}
                        </Badge>
                      ) : null}
                    </div>
                    <span className="tnum shrink-0 text-[0.625rem] text-muted-foreground/80">
                      {formatDateTimeIST(entry.at || entry.timestamp || "")}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    {entry.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[0.625rem] text-muted-foreground/80">
                    <span className="rounded bg-surface-container-high/70 px-1.5 py-0.5 font-medium text-foreground/80">
                      {entry.action}
                    </span>
                    {entry.projectContext ? (
                      <span className="truncate">
                        {entry.projectContext}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
