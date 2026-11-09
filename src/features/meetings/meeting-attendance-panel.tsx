"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Lock,
  LockOpen,
  Printer,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDateTimeIST } from "@/lib/time";
import type { Meeting } from "@/types/event";
import type {
  MeetingAudienceRow,
  MeetingAudienceStatus,
  MeetingCounts,
} from "@/lib/mock-data/meetings";

export interface MeetingCorrectionRecord {
  rollNumber: string;
  oldStatus: MeetingAudienceStatus;
  newStatus: MeetingAudienceStatus;
  reason: string;
  at: string;
}

interface MeetingAttendancePanelProps {
  meeting: Meeting;
  rows: MeetingAudienceRow[];
  counts: MeetingCounts;
  isLocked: boolean;
  canEdit: boolean;
  onMark: (rollNumber: string, status: MeetingAudienceStatus) => void;
  onBulkPresent: () => void;
  onToggleLock: () => void;
  corrections: MeetingCorrectionRecord[];
}

const STATUS_LABEL: Record<MeetingAudienceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export function MeetingAttendancePanel({
  meeting,
  rows,
  counts,
  isLocked,
  canEdit,
  onMark,
  onBulkPresent,
  onToggleLock,
  corrections,
}: MeetingAttendancePanelProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    MeetingAudienceStatus | "ALL"
  >("ALL");
  const [bulkOpen, setBulkOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter(
        (row) =>
          row.volunteer.name.toLowerCase().includes(query) ||
          row.volunteer.rollNumber.includes(query),
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((row) => row.status === statusFilter);
    }
    return list;
  }, [rows, search, statusFilter]);

  const marked = rows.filter((row) => row.status !== "ABSENT").length;
  const progress =
    rows.length > 0 ? Math.round((marked / rows.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2 text-label-sm">
            <Badge
              variant="outline"
              className="border-success/30 bg-success-container/60 text-success"
            >
              <CheckCircle2 className="mr-1 size-3" />
              {counts.present} present
            </Badge>
            <Badge
              variant="outline"
              className="border-warning/30 bg-warning-container/60 text-warning"
            >
              <Clock className="mr-1 size-3" />
              {counts.excused} excused
            </Badge>
            <Badge
              variant="outline"
              className="border-destructive/30 bg-error-container/60 text-destructive"
            >
              <XCircle className="mr-1 size-3" />
              {counts.absent} absent
            </Badge>
            <Badge
              variant="outline"
              className="border-border bg-muted/50 text-muted-foreground"
            >
              <Users className="mr-1 size-3" />
              {counts.audience} in audience
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 px-2.5 text-label-xs text-muted-foreground hover:text-foreground"
            >
              <Printer className="mr-1.5 size-3.5" />
              Print sheet
            </Button>
            {canEdit && !isLocked && (
              <Button
                size="sm"
                onClick={() => setBulkOpen(true)}
                className="h-8 px-2.5 text-label-xs"
              >
                <Users className="mr-1.5 size-3.5" />
                Mark everyone present
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleLock}
                className="h-8 px-2.5 text-label-xs"
              >
                {isLocked ? (
                  <>
                    <LockOpen className="mr-1.5 size-3.5" />
                    Unlock register
                  </>
                ) : (
                  <>
                    <Lock className="mr-1.5 size-3.5" />
                    Lock early
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-label-xs text-muted-foreground">
            <span>
              {marked} of {rows.length} marked
            </span>
            <span>Locks {formatDateTimeIST(meeting.attendanceLockAt)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!canEdit && (
          <div className="rounded-lg border border-border/60 bg-surface-container-low/40 p-3 text-[11px] text-muted-foreground">
            Attendance can be marked once the meeting is ongoing or completed.
            Start the meeting from the header above.
          </div>
        )}

        {isLocked && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-container/60 p-3 text-label-xs text-warning">
            <span className="flex items-center gap-2">
              <Lock className="size-4 shrink-0" />
              <span>
                <strong>Attendance is locked.</strong> Any change opens an
                audited correction that needs a reason of at least 10
                characters.
              </span>
            </span>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleLock}
                className="h-7 shrink-0 border-warning/30 text-[11px] text-warning"
              >
                Unlock register
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 border-border bg-background pl-9 text-body-sm"
              aria-label="Search the meeting audience"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              value && setStatusFilter(value as MeetingAudienceStatus | "ALL")
            }
          >
            <SelectTrigger className="h-9 w-[140px] border-border bg-background text-label-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="EXCUSED">Excused</SelectItem>
              <SelectItem value="ABSENT">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[30%]">Volunteer</TableHead>
                <TableHead className="w-[14%]">Project</TableHead>
                <TableHead className="w-[10%] text-center">Year</TableHead>
                <TableHead className="w-[16%]">Status</TableHead>
                <TableHead className="w-[16%] text-right">Mark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-muted-foreground"
                  >
                    Nobody in the audience matches this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow
                    key={row.volunteer.rollNumber}
                    className="hover:bg-muted/20"
                  >
                    <TableCell className="py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          prefetch={false}
                          href={`/volunteers/${row.volunteer.rollNumber}`}
                          className="text-body-sm font-medium text-foreground hover:text-primary"
                        >
                          {row.volunteer.name}
                        </Link>
                        {row.isOfficeBearer && (
                          <Badge
                            variant="outline"
                            className="border-primary/25 bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                          >
                            <ShieldCheck className="mr-0.5 size-2.5" />
                            Post holder
                          </Badge>
                        )}
                        {!row.countsForAbsence && !row.isOfficeBearer && (
                          <Badge
                            variant="outline"
                            className="border-border bg-muted/50 px-1.5 py-0 text-[10px] text-muted-foreground"
                          >
                            Never absent
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-label-xs text-muted-foreground">
                        {row.volunteer.rollNumber}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-label-sm text-muted-foreground">
                      {row.volunteer.project ?? "General"}
                    </TableCell>
                    <TableCell className="py-3 text-center text-label-sm text-muted-foreground">
                      {row.volunteer.year}
                    </TableCell>
                    <TableCell className="py-3">
                      {row.status === "PRESENT" ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 bg-success-container/60 text-[11px] text-success"
                        >
                          <CheckCircle2 className="mr-1 size-3" />
                          Present
                        </Badge>
                      ) : row.status === "EXCUSED" ? (
                        <Badge
                          variant="outline"
                          className="border-warning/30 bg-warning-container/60 text-[11px] text-warning"
                        >
                          <Clock className="mr-1 size-3" />
                          Excused
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-error-container/60 text-[11px] text-destructive"
                        >
                          <XCircle className="mr-1 size-3" />
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(
                          [
                            "PRESENT",
                            "EXCUSED",
                            "ABSENT",
                          ] as MeetingAudienceStatus[]
                        ).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={
                              row.status === status ? "default" : "outline"
                            }
                            disabled={!canEdit}
                            onClick={() =>
                              onMark(row.volunteer.rollNumber, status)
                            }
                            title={`Mark ${STATUS_LABEL[status].toLowerCase()}`}
                            className={`h-7 px-2.5 text-[11px] font-semibold ${
                              row.status === status
                                ? status === "PRESENT"
                                  ? "bg-success text-white hover:bg-success"
                                  : status === "EXCUSED"
                                    ? "bg-warning text-white hover:bg-warning"
                                    : "bg-error text-white hover:bg-error"
                                : "text-muted-foreground"
                            }`}
                          >
                            {status === "PRESENT"
                              ? "P"
                              : status === "EXCUSED"
                                ? "E"
                                : "A"}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {corrections.length > 0 && (
        <Card className="space-y-3 border-border bg-card p-5 shadow-xs">
          <h3 className="text-headline-sm text-foreground">
            Corrections this session
          </h3>
          <ul className="divide-y divide-border/60">
            {corrections.map((correction) => (
              <li
                key={`${correction.rollNumber}-${correction.at}`}
                className="flex flex-wrap items-start justify-between gap-2 py-2 text-label-sm"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-foreground">
                    {correction.rollNumber}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {STATUS_LABEL[correction.oldStatus]} →{" "}
                    {STATUS_LABEL[correction.newStatus]}
                  </span>
                  <p className="text-label-xs text-muted-foreground">
                    {correction.reason}
                  </p>
                </div>
                <span className="text-label-xs text-muted-foreground">
                  {formatDateTimeIST(correction.at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Mark everyone present?"
        description={`This marks all ${rows.length} people in the audience present. Excused rows become present too. You can still correct individual rows while the register is unlocked.`}
        confirmLabel="Mark all present"
        onConfirm={onBulkPresent}
      />
    </div>
  );
}
