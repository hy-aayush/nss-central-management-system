import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DataQualityIssue } from "@/types/analytics";

interface DataQualityAlertProps {
  issues: DataQualityIssue[];
}

export function DataQualityAlert({ issues }: DataQualityAlertProps) {
  if (!issues || issues.length === 0) {
    return (
      <Card className="p-4 bg-success/5 border-success/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-success shrink-0" />
          <div>
            <p className="text-body-sm font-medium text-foreground">All operational records healthy</p>
            <p className="text-body-xs text-muted-foreground">Zero unfinalized attendance registers or pending data-quality alerts.</p>
          </div>
        </div>
      </Card>
    );
  }

  const highPriority = issues.filter((i) => i.severity === "HIGH");
  const mediumPriority = issues.filter((i) => i.severity === "MEDIUM");
  const lowPriority = issues.filter((i) => i.severity === "LOW");
  const displayIssues = [...highPriority, ...mediumPriority, ...lowPriority];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" />
          <h2 className="text-label-md font-semibold text-foreground">Operational Action Items</h2>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-body-xs">
            {issues.length} {issues.length === 1 ? "alert" : "alerts"}
          </Badge>
        </div>
        <span className="text-body-xs text-muted-foreground">Automatic Daily Integrity Checks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayIssues.map((issue) => {
          const isHigh = issue.severity === "HIGH";
          const isMedium = issue.severity === "MEDIUM";

          return (
            <Card
              key={issue.id}
              className={`p-3.5 flex flex-col justify-between border transition-colors hover:shadow-xs ${
                isHigh
                  ? "bg-destructive/5 border-destructive/25"
                  : isMedium
                  ? "bg-warning/5 border-warning/25"
                  : "bg-info/5 border-info/25"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 ${
                      isHigh
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : isMedium
                        ? "bg-warning/15 text-warning border-warning/30"
                        : "bg-info/15 text-info border-info/30"
                    }`}
                  >
                    {issue.severity} Priority
                  </Badge>
                  <span className="text-body-xs font-mono font-semibold text-muted-foreground">
                    {issue.affectedCount} affected
                  </span>
                </div>
                <p className="text-body-sm font-medium text-foreground leading-snug">
                  {issue.message}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-border/40">
                <Link
                  href={issue.targetUrl}
                  className="inline-flex items-center gap-1 text-body-xs font-medium text-primary hover:underline"
                >
                  Resolve issue
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
