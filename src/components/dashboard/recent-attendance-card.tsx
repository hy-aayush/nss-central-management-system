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
import { formatDateIST } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { AttendanceRecord, AttendanceSummary } from "@/types/event";
import { ClipboardCheck, ArrowRight, Lock, AlertCircle } from "lucide-react";

interface RecentAttendanceCardProps {
  records: AttendanceRecord[];
  summaries: Record<string, AttendanceSummary>;
  limit?: number;
}

export function RecentAttendanceCard({
  records,
  summaries,
  limit = 5,
}: RecentAttendanceCardProps) {
  const recentItems = records.slice(0, limit).map((record) => {
    const summaryKey = String(record.eventId ?? record.entityId);
    const summary =
      summaries[summaryKey] || summaries[`meet-${record.entityId}`];
    const details = record.details;
    const title =
      details && "title" in details
        ? details.title
        : details && "agenda" in details
          ? details.agenda
          : `Session #${record.id}`;
    const date =
      details && "startsAt" in details
        ? details.startsAt
        : details && "date" in details
          ? details.date
          : new Date().toISOString();

    return {
      id: record.id,
      title,
      date,
      type: record.attendanceFor,
      turnout: summary?.turnoutPercentage ?? 0,
      present: summary?.presentCount ?? 0,
      total: summary?.totalEligible ?? 0,
      isLocked: summary?.isLocked ?? true,
      hasCorrection: Boolean(record.correctedBy),
      href: `/attendance/${record.id}`,
    };
  });

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Recent attendance
          </CardTitle>
          <CardDescription>
            Verified turnout and roster lock status
          </CardDescription>
        </div>
        <Link
          href="/attendance"
          className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          View all
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between">
        {recentItems.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No attendance yet"
            description="No attendance sessions have been logged or finalised."
            className="my-auto border-0 bg-transparent py-8"
          />
        ) : (
          <ul className="-mx-1 divide-y divide-border/50">
            {recentItems.map((item) => {
              const tone =
                item.turnout >= 90
                  ? "success"
                  : item.turnout >= 75
                    ? "warning"
                    : "error";

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-1 py-2.5 transition-colors hover:bg-surface-container-low/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="h-4 rounded px-1.5 text-[0.5625rem] font-medium tracking-wide uppercase"
                          >
                            {item.type}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[0.5625rem] text-muted-foreground">
                            {item.isLocked ? (
                              <>
                                <Lock className="size-2.5" />
                                Locked
                              </>
                            ) : (
                              <>
                                <AlertCircle className="size-2.5 text-warning" />
                                Open
                              </>
                            )}
                          </span>
                          {item.hasCorrection ? (
                            <span className="rounded bg-primary/10 px-1 py-0.5 text-[0.5625rem] font-medium text-primary">
                              Corrected
                            </span>
                          ) : null}
                        </div>

                        <p className="truncate text-[0.8125rem] font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="tnum text-[0.6875rem] text-muted-foreground">
                          {formatDateIST(item.date)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "tnum text-[0.9375rem] leading-none font-semibold",
                            tone === "success" && "text-success",
                            tone === "warning" && "text-warning",
                            tone === "error" && "text-destructive",
                          )}
                        >
                          {item.turnout.toFixed(1)}%
                        </p>
                        <p className="tnum mt-1 text-[0.625rem] text-muted-foreground">
                          {item.present}/{item.total}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={cn(
                          "h-full origin-left rounded-full",
                          tone === "success" && "bg-success/80",
                          tone === "warning" && "bg-warning/80",
                          tone === "error" && "bg-destructive/80",
                        )}
                        style={{ width: `${Math.min(item.turnout, 100)}%` }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
