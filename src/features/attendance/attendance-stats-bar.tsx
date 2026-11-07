import { Users, CheckCircle2, XCircle, Clock, Lock, Unlock } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import { Badge } from "@/components/ui/badge";

interface AttendanceStatsBarProps {
  total: number;
  present: number;
  absent: number;
  excused: number;
  isLocked: boolean;
}

export function AttendanceStatsBar({
  total,
  present,
  absent,
  excused,
  isLocked,
}: AttendanceStatsBarProps) {
  const turnoutPercent =
    total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

  return (
    <MetricStrip
      columns={5}
      items={[
        {
          label: "Total roster",
          value: total,
          hint: "Eligible for this session",
          icon: Users,
        },
        {
          label: "Present",
          value: present,
          hint: "Verified in attendance",
          icon: CheckCircle2,
          tone: "success",
        },
        {
          label: "Absent",
          value: absent,
          hint: "Not marked present",
          icon: XCircle,
          tone: "danger",
        },
        {
          label: "Excused",
          value: excused,
          hint: "Approved exceptions",
          icon: Clock,
          tone: "warning",
        },
        {
          label: "Turnout",
          value: `${turnoutPercent}%`,
          hint: "Present over eligible",
          tone: "primary",
        },
      ]}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span>
            Roster locks at midnight IST on the day after the session.
          </span>
          {isLocked ? (
            <Badge
              variant="outline"
              className="h-5 shrink-0 gap-1 rounded border-warning/30 bg-warning-container/60 px-1.5 text-[0.5625rem] text-on-warning-container"
            >
              <Lock className="size-2.5" />
              Locked
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-5 shrink-0 gap-1 rounded border-success/30 bg-success-container/60 px-1.5 text-[0.5625rem] text-on-success-container"
            >
              <Unlock className="size-2.5" />
              Open
            </Badge>
          )}
        </div>
      }
    />
  );
}
