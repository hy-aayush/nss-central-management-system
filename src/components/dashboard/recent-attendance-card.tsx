import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateIST } from "@/lib/time";
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
  // Take up to `limit` records
  const recentItems = records.slice(0, limit).map((record) => {
    const summaryKey = String(record.eventId ?? record.entityId);
    const summary = summaries[summaryKey] || summaries[`meet-${record.entityId}`];
    const details = record.details;
    const title = details && "title" in details ? details.title : (details && "agenda" in details ? details.agenda : `Session #${record.id}`);
    const date = details && "startsAt" in details ? details.startsAt : (details && "date" in details ? details.date : new Date().toISOString());

    const turnout = summary?.turnoutPercentage ?? 0;
    const present = summary?.presentCount ?? 0;
    const total = summary?.totalEligible ?? 0;
    const isLocked = summary?.isLocked ?? true;

    return {
      id: record.id,
      title,
      date,
      type: record.attendanceFor,
      turnout,
      present,
      total,
      isLocked,
      hasCorrection: Boolean(record.correctedBy),
      href: `/attendance/${record.id}`,
    };
  });

  return (
    <Card className="border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Recent Attendance
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Verified turnout ratios and roster lock status
          </CardDescription>
        </div>
        <Link
          href="/attendance"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground",
          })}
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-1">
        {recentItems.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No Attendance Data"
            description="No recent attendance sessions have been logged or finalized."
            className="py-8 my-auto"
          />
        ) : (
          <div className="divide-y divide-border/50 -mx-2 px-2">
            {recentItems.map((item) => {
              // Color badge based on turnout
              const turnoutColor =
                item.turnout >= 90
                  ? "text-emerald-700 dark:text-emerald-400"
                  : item.turnout >= 75
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-rose-700 dark:text-rose-400";

              const progressColor =
                item.turnout >= 90
                  ? "bg-emerald-500"
                  : item.turnout >= 75
                  ? "bg-amber-500"
                  : "bg-rose-500";

              return (
                <div
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col gap-2.5 transition-colors hover:bg-muted/30 p-2 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                          {item.type}
                        </Badge>
                        {item.isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <AlertCircle className="h-2.5 w-2.5" />
                            Open
                          </span>
                        )}
                        {item.hasCorrection && (
                          <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                            Audit Corrected
                          </span>
                        )}
                      </div>

                      <Link
                        href={item.href}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate mt-1"
                      >
                        {item.title}
                      </Link>

                      <p className="text-xs text-muted-foreground">
                        Conducted on {formatDateIST(item.date)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-bold font-mono ${turnoutColor}`}>
                        {item.turnout.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {item.present} / {item.total} Present
                      </div>
                    </div>
                  </div>

                  {/* Turnout Progress Bar */}
                  <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(item.turnout, 100)}%` }}
                    />
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
