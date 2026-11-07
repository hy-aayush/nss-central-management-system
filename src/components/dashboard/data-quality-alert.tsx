import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DataQualityIssue } from "@/types/analytics";

interface DataQualityAlertProps {
  issues: DataQualityIssue[];
}

const SEVERITY_TONE = {
  HIGH: {
    dot: "bg-destructive",
    label: "High",
    text: "text-destructive",
  },
  MEDIUM: {
    dot: "bg-warning",
    label: "Medium",
    text: "text-warning",
  },
  LOW: {
    dot: "bg-info",
    label: "Low",
    text: "text-info",
  },
} as const;

/**
 * Operational action items. Deliberately a single compact strip rather than
 * three coloured cards: the dashboard should surface the count, and the
 * detail belongs on the destination screen.
 */
export function DataQualityAlert({ issues }: DataQualityAlertProps) {
  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-success/25 bg-success-container/40 px-3.5 py-2.5">
        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-[0.75rem] text-foreground">
          <span className="font-medium">All records healthy.</span>{" "}
          <span className="text-muted-foreground">
            No unfinalised registers or pending data-quality alerts.
          </span>
        </p>
      </div>
    );
  }

  const ordered = [...issues].sort((a, b) => {
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    return rank[a.severity] - rank[b.severity];
  });
  const highCount = issues.filter((issue) => issue.severity === "HIGH").length;

  return (
    <section
      aria-labelledby="action-items-heading"
      className="rounded-xl border border-border/70 bg-card/70 p-3.5 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="size-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <h2
            id="action-items-heading"
            className="text-[0.8125rem] font-medium text-foreground"
          >
            Operational action items
          </h2>
          <Badge
            variant="outline"
            className="h-4 rounded border-warning/30 bg-warning-container/60 px-1.5 text-[0.5625rem] text-on-warning-container"
          >
            {issues.length} open
          </Badge>
          {highCount > 0 ? (
            <span className="hidden text-[0.625rem] text-muted-foreground sm:inline">
              {highCount} need attention today
            </span>
          ) : null}
        </div>
        <span className="text-[0.625rem] text-muted-foreground/70">
          Daily integrity checks
        </span>
      </div>

      <ul className="mt-2.5 grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((issue) => {
          const tone = SEVERITY_TONE[issue.severity];
          return (
            <li key={issue.id}>
              <Link
                href={issue.targetUrl}
                className={cn(
                  "group flex items-start gap-2 rounded-lg border border-border/50 bg-surface-container-low/30 px-2.5 py-2",
                  "transition-colors duration-200 hover:border-border hover:bg-surface-container-low/70",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", tone.dot)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.75rem] leading-snug text-foreground">
                    {issue.message}
                  </span>
                  <span className="mt-0.5 block text-[0.625rem] text-muted-foreground">
                    {tone.label} priority · {issue.affectedCount} affected
                  </span>
                </span>
                <ArrowRight className="mt-1 size-3 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
