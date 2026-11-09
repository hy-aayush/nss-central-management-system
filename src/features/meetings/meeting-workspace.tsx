"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Globe2,
  Hammer,
  MapPin,
  Play,
  Square,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { formatClockTimeIST, formatDateIST } from "@/lib/time";
import type { Meeting } from "@/types/event";
import type {
  MeetingAudienceRow,
  MeetingAudienceStatus,
  MeetingCounts,
} from "@/lib/mock-data/meetings";
import {
  MeetingAttendancePanel,
  type MeetingCorrectionRecord,
} from "./meeting-attendance-panel";
import { MeetingCorrectionDialog } from "./meeting-correction-dialog";
import { MeetingMinutesPanel } from "./meeting-minutes-panel";
import { MeetingRulesPanel } from "./meeting-rules-panel";
import type { MeetingCorrectionValues } from "./meeting-schemas";

interface MeetingWorkspaceProps {
  meeting: Meeting;
  initialRows: MeetingAudienceRow[];
  defaultTab: string;
}

const TYPE_META: Record<
  Meeting["type"],
  { label: string; icon: typeof Globe2; className: string }
> = {
  CENTRAL: {
    label: "Central meeting",
    icon: Globe2,
    className: "border-primary/20 bg-primary/[0.07] text-primary",
  },
  PROJECT: {
    label: "Project meeting",
    icon: Building2,
    className: "border-info/20 bg-info-container/60 text-on-info-container",
  },
  BUILDERS: {
    label: "Builders meeting",
    icon: Hammer,
    className: "border-warning/25 bg-warning-container/60 text-warning",
  },
};

function deriveCounts(rows: MeetingAudienceRow[]): MeetingCounts {
  const eligible = rows.filter((row) => row.countsForAbsence).length;
  const present = rows.filter((row) => row.status === "PRESENT").length;
  const excused = rows.filter((row) => row.status === "EXCUSED").length;
  const absent = rows.filter(
    (row) => row.status === "ABSENT" && row.countsForAbsence,
  ).length;

  return {
    audience: rows.length,
    eligible,
    present,
    excused,
    absent,
    turnout: eligible > 0 ? Math.round((present / eligible) * 1000) / 10 : null,
  };
}

export function MeetingWorkspace({
  meeting: initialMeeting,
  initialRows,
  defaultTab,
}: MeetingWorkspaceProps) {
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [rows, setRows] = useState<MeetingAudienceRow[]>(initialRows);
  const [isLocked, setIsLocked] = useState(meeting.isAttendanceLocked);
  const [corrections, setCorrections] = useState<MeetingCorrectionRecord[]>([]);
  const [mom, setMom] = useState<string | null>(meeting.mom);
  const [momAt, setMomAt] = useState<string | null>(meeting.momAt ?? null);
  const [momBy, setMomBy] = useState<string | null>(meeting.momBy);
  const [editsLeft, setEditsLeft] = useState<number | null>(
    meeting.momEditsLeft,
  );
  const [tab, setTab] = useState(defaultTab);

  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] =
    useState<MeetingAudienceRow | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const counts = useMemo(() => deriveCounts(rows), [rows]);

  const canEditAttendance =
    meeting.status === "ONGOING" || meeting.status === "COMPLETED";

  const canEditMinutes =
    meeting.status === "COMPLETED" &&
    (mom === null || editsLeft === null || editsLeft > 0);

  const updateStatus = (
    status: Meeting["status"],
    extra: Partial<Meeting> = {},
  ) => {
    setMeeting((current) => ({ ...current, status, ...extra }));
  };

  const handleStart = () => {
    updateStatus("ONGOING", { startedAt: new Date().toISOString() });
    toast.success("Meeting started", {
      description: "Roll call is open until midnight IST tomorrow.",
    });
    setTab("attendance");
  };

  const handleEnd = () => {
    updateStatus("COMPLETED", { endedAt: new Date().toISOString() });
    toast.success("Meeting completed", {
      description:
        "Minutes can be written now; the register still closes at midnight IST.",
    });
  };

  const handleCancel = (reason?: string) => {
    updateStatus("CANCELLED", {
      cancellationReason: reason ?? "Cancelled by a Coordinator.",
    });
    toast.info("Meeting cancelled", {
      description: "The reason is kept on the meeting record.",
    });
  };

  const handleMark = (
    rollNumber: string,
    nextStatus: MeetingAudienceStatus,
  ) => {
    const row = rows.find((item) => item.volunteer.rollNumber === rollNumber);
    if (!row || row.status === nextStatus) return;

    if (isLocked) {
      setCorrectionTarget(row);
      setCorrectionOpen(true);
      return;
    }

    setRows((current) =>
      current.map((item) =>
        item.volunteer.rollNumber === rollNumber
          ? { ...item, status: nextStatus }
          : item,
      ),
    );

    toast.success(`${row.volunteer.name} marked ${nextStatus.toLowerCase()}`, {
      description: `Roll ${rollNumber} updated. Absent rows are simply removed.`,
    });
  };

  const handleConfirmCorrection = (values: MeetingCorrectionValues) => {
    if (!correctionTarget) return;
    const rollNumber = correctionTarget.volunteer.rollNumber;

    setRows((current) =>
      current.map((item) =>
        item.volunteer.rollNumber === rollNumber
          ? { ...item, status: values.newStatus }
          : item,
      ),
    );

    setCorrections((current) => [
      {
        rollNumber,
        oldStatus: values.oldStatus,
        newStatus: values.newStatus,
        reason: values.reason,
        at: new Date().toISOString(),
      },
      ...current,
    ]);

    toast.success("Correction recorded", {
      description: `${rollNumber}: ${values.oldStatus} → ${values.newStatus}.`,
    });
  };

  const handleBulkPresent = () => {
    setRows((current) =>
      current.map((item) => ({
        ...item,
        status: "PRESENT" as MeetingAudienceStatus,
      })),
    );
    toast.success("Everyone marked present", {
      description: `${rows.length} audience rows updated.`,
    });
  };

  const handleToggleLock = () => {
    setIsLocked((current) => {
      const next = !current;
      toast.info(next ? "Register locked" : "Register unlocked", {
        description: next
          ? "Further changes need an audited correction with a reason."
          : "Direct marking is possible again until the next lock.",
      });
      return next;
    });
  };

  const handleSaveMinutes = (value: string) => {
    setMom(value);
    setMomAt(new Date().toISOString());
    setMomBy("2105404");
    setEditsLeft((current) => {
      if (current === null) return null;
      if (mom === null) return current;
      return Math.max(current - 1, 0);
    });
    toast.success("Minutes saved", {
      description:
        "Stored with the meeting. The word limit is enforced before saving.",
    });
  };

  const typeMeta = TYPE_META[meeting.type];
  const TypeIcon = typeMeta.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/meetings"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-8 px-2 text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to meetings
        </Link>
      </div>

      <Card className="space-y-4 border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium",
                  typeMeta.className,
                )}
              >
                <TypeIcon className="mr-1 size-3" />
                {typeMeta.label}
                {meeting.type === "PROJECT" && meeting.project
                  ? ` · ${meeting.project}`
                  : ""}
              </Badge>
              <StatusBadge status={meeting.status} />
              {meeting.needsReview && (
                <Badge
                  variant="outline"
                  className="border-warning/30 bg-warning-container/60 text-[11px] text-warning"
                >
                  Needs review
                </Badge>
              )}
            </div>

            <h1 className="text-headline-lg max-w-3xl text-foreground">
              {meeting.agenda}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-label-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatDateIST(`${meeting.date}T00:00:00+05:30`)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatClockTimeIST(meeting.startTime)}
                {meeting.endTime
                  ? ` – ${formatClockTimeIST(meeting.endTime)}`
                  : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {meeting.venue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />
                {counts.audience} in audience
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {meeting.status === "SCHEDULED" ||
            meeting.status === "RESCHEDULED" ? (
              <Button
                size="sm"
                onClick={handleStart}
                className="h-8 text-label-xs"
              >
                <Play className="mr-1.5 size-3.5" />
                Start meeting
              </Button>
            ) : null}

            {meeting.status === "ONGOING" && (
              <Button
                size="sm"
                onClick={handleEnd}
                className="h-8 text-label-xs"
              >
                <Square className="mr-1.5 size-3.5" />
                End meeting
              </Button>
            )}

            {meeting.status !== "CANCELLED" &&
              meeting.status !== "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                  className="h-8 text-label-xs text-destructive hover:bg-error-container/50"
                >
                  <XCircle className="mr-1.5 size-3.5" />
                  Cancel
                </Button>
              )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab("minutes")}
              className="h-8 text-label-xs"
            >
              <FileText className="mr-1.5 size-3.5" />
              Minutes
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="rounded-xl border border-border bg-muted/50 p-1">
          <TabsTrigger value="attendance" className="gap-1.5 text-label-sm">
            <Users className="size-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="minutes" className="gap-1.5 text-label-sm">
            <FileText className="size-4" />
            Minutes
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5 text-label-sm">
            <Globe2 className="size-4" />
            Rules &amp; snapshot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="pt-3">
          <MeetingAttendancePanel
            meeting={meeting}
            rows={rows}
            counts={counts}
            isLocked={isLocked}
            canEdit={canEditAttendance}
            onMark={handleMark}
            onBulkPresent={handleBulkPresent}
            onToggleLock={handleToggleLock}
            corrections={corrections}
          />
        </TabsContent>

        <TabsContent value="minutes" className="pt-3">
          <MeetingMinutesPanel
            meeting={meeting}
            mom={mom}
            momBy={momBy}
            momAt={momAt}
            editsLeft={editsLeft}
            editable={canEditMinutes}
            onSave={handleSaveMinutes}
          />
        </TabsContent>

        <TabsContent value="rules" className="pt-3">
          <MeetingRulesPanel meeting={meeting} counts={counts} />
        </TabsContent>
      </Tabs>

      <MeetingCorrectionDialog
        open={correctionOpen}
        onOpenChange={setCorrectionOpen}
        row={correctionTarget}
        onConfirm={handleConfirmCorrection}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this meeting?"
        description="Cancelling keeps the record and requires a reason of at least 10 characters. Attendance and minutes stay closed."
        confirmLabel="Cancel meeting"
        variant="destructive"
        requireReason
        reasonLabel="Why is it cancelled?"
        reasonPlaceholder="At least 10 characters, e.g. venue flooded after overnight rain."
        onConfirm={handleCancel}
      />
    </div>
  );
}
