import { CalendarClock, Info, ShieldCheck, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeIST } from "@/lib/time";
import type { Meeting } from "@/types/event";
import type { MeetingCounts } from "@/lib/mock-data/meetings";

interface MeetingRulesPanelProps {
  meeting: Meeting;
  counts: MeetingCounts;
}

const AUDIENCE_RULE: Record<Meeting["type"], string> = {
  CENTRAL: "Every ACTIVE volunteer, in every project.",
  PROJECT: "ACTIVE volunteers of this project only.",
  BUILDERS: "Holders of an active Builder or Project Representative post.",
};

export function MeetingRulesPanel({ meeting, counts }: MeetingRulesPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3 border-border bg-card p-5 shadow-xs">
        <h3 className="text-headline-sm flex items-center gap-2 text-foreground">
          <Users className="size-4 text-primary" />
          Who is counted
        </h3>
        <p className="text-body-sm text-muted-foreground">
          {AUDIENCE_RULE[meeting.type]}
        </p>

        <dl className="space-y-2 text-label-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <dt className="text-muted-foreground">Audience</dt>
            <dd className="font-semibold text-foreground">{counts.audience}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <dt className="text-muted-foreground">Counted for absence</dt>
            <dd className="font-semibold text-foreground">{counts.eligible}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <dt className="text-muted-foreground">
              Present / excused / absent
            </dt>
            <dd className="font-semibold text-foreground">
              {counts.present} / {counts.excused} / {counts.absent}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Turnout</dt>
            <dd className="font-semibold text-primary">
              {counts.turnout === null ? "—" : `${counts.turnout}%`}
            </dd>
          </div>
        </dl>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          4th years are never counted absent, and neither are Coordinators or
          Tech members. Both groups are still marked present when they attend.
        </p>
      </Card>

      <Card className="space-y-3 border-border bg-card p-5 shadow-xs">
        <h3 className="text-headline-sm flex items-center gap-2 text-foreground">
          <CalendarClock className="size-4 text-primary" />
          Lock and lifecycle
        </h3>

        <div className="space-y-2 text-label-sm">
          <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5">
            <span className="text-muted-foreground">Attendance opens</span>
            <span className="text-right font-medium text-foreground">
              when the meeting starts
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5">
            <span className="text-muted-foreground">Attendance locks</span>
            <span className="text-right font-medium text-foreground">
              {formatDateTimeIST(meeting.attendanceLockAt)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5">
            <span className="text-muted-foreground">Snapshots at finalise</span>
            <span className="text-right font-medium text-foreground">
              {meeting.eligibleCount === null
                ? "Not finalised yet"
                : `${meeting.presentCount ?? 0} present of ${meeting.eligibleCount} eligible`}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Details edit budget</span>
            <span className="text-right font-medium text-foreground">
              {meeting.editsLeft === null
                ? "Exempt"
                : `${meeting.editsLeft} left`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant="outline"
            className="border-border bg-muted/50 text-[11px] text-muted-foreground"
          >
            Status is stored
          </Badge>
          <Badge
            variant="outline"
            className="border-warning/30 bg-warning-container/60 text-[11px] text-warning"
          >
            Absent = no row
          </Badge>
        </div>

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />A meeting that was never
          started and whose day has passed is not finalised. It shows as
          &quot;not held?&quot; until someone cancels it or marks attendance.
        </p>
      </Card>

      {meeting.cancellationReason && (
        <Card className="border-destructive/30 bg-error-container/40 p-5 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-label-sm font-semibold text-destructive">
            <ShieldCheck className="size-4" />
            Cancellation reason
          </h3>
          <p className="mt-1 text-body-sm text-destructive/90">
            {meeting.cancellationReason}
          </p>
        </Card>
      )}
    </div>
  );
}
