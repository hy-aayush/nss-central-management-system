"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { notify } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricStrip } from "@/components/shared/metric-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateIST, formatDateTimeIST } from "@/lib/time";
import type { HoursApprovalRow, HoursRecomputeState } from "@/types/hours";

interface HoursApprovalPanelProps {
  academicYear: number;
  initialRows: HoursApprovalRow[];
  recompute: HoursRecomputeState;
  volunteerCount: number;
}

export function HoursApprovalPanel({
  academicYear,
  initialRows,
  recompute,
  volunteerCount,
}: HoursApprovalPanelProps) {
  const [rows, setRows] = useState<HoursApprovalRow[]>(initialRows);
  const [draftHours, setDraftHours] = useState<Record<number, number>>(() =>
    Object.fromEntries(
      initialRows.map((row) => [
        row.eventId,
        row.hours ?? row.categoryDefaultHours,
      ]),
    ),
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [recomputeAt, setRecomputeAt] = useState<string | null>(
    recompute.lastRecomputedAt,
  );
  const [recomputeOpen, setRecomputeOpen] = useState(false);

  const pending = useMemo(() => rows.filter((row) => !row.approved), [rows]);
  const approvedRows = rows.filter((row) => row.approved);
  const totalApproved = approvedRows.reduce(
    (sum, row) => sum + (row.hours ?? 0),
    0,
  );

  const toggleRow = (eventId: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const approveSelected = () => {
    if (selected.size === 0) return;
    const now = new Date().toISOString();

    setRows((current) =>
      current.map((row) =>
        selected.has(row.eventId)
          ? {
              ...row,
              approved: true,
              hours: draftHours[row.eventId] ?? row.categoryDefaultHours,
              approvedBy: "2105404",
              approvedAt: now,
            }
          : row,
      ),
    );

    notify(
      "success",
      `Approved ${selected.size} event${selected.size === 1 ? "" : "s"}`,
      {
        description:
          "One HOURS_APPROVE audit row is written for the bulk save in the real service.",
      },
    );
    setSelected(new Set());
  };

  const handleRecompute = () => {
    const now = new Date().toISOString();
    setRecomputeAt(now);
    notify("success", "Hours recomputed", {
      description: `${volunteerCount} volunteer rollups updated for ${academicYear}; allocated hours refreshed in the same transaction.`,
    });
  };

  return (
    <div className="space-y-4">
      <MetricStrip
        columns={3}
        items={[
          {
            label: "Approved hours",
            value: totalApproved.toFixed(1),
            hint: `${approvedRows.length} events approved`,
            icon: BadgeCheck,
            tone: "success",
          },
          {
            label: "Pending approval",
            value: pending.length,
            hint: "completed events without a value",
            icon: Clock,
            tone: pending.length > 0 ? "warning" : "default",
          },
          {
            label: "Last recompute",
            value: recomputeAt ? formatDateTimeIST(recomputeAt) : "Never",
            hint: `${volunteerCount} rollups written`,
            icon: RefreshCw,
          },
        ]}
      />

      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-headline-sm text-foreground">
              Event hours for {academicYear}–
              {String(academicYear + 1).slice(-2)}
            </h2>
            <p className="mt-0.5 max-w-2xl text-body-sm text-muted-foreground">
              Every completed, non-imported event, prefilled with its category
              default. Edit a value, select the rows and approve; volunteer
              pages change only after you recompute.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={selected.size === 0}
              onClick={approveSelected}
              className="h-8 text-label-xs"
            >
              <CheckCircle2 className="mr-1.5 size-3.5" />
              Approve selected ({selected.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecomputeOpen(true)}
              className="h-8 text-label-xs"
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Recompute
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-container-low/40 p-3 text-[11px] text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
          <span>
            Camp rule: when a volunteer attends at least the minimum number of
            events in a group, the group&apos;s full hours replace the sum of
            the individual events. Excused attendance earns nothing.
          </span>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={`No completed events in ${academicYear}`}
            description="Hours are approved for completed, non-imported events. Finish an event first."
            className="border border-dashed border-border"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-10">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="w-[34%]">Event</TableHead>
                  <TableHead className="w-[12%]">Date</TableHead>
                  <TableHead className="w-[10%] text-center">Default</TableHead>
                  <TableHead className="w-[16%]">Approved hours</TableHead>
                  <TableHead className="w-[10%] text-center">Present</TableHead>
                  <TableHead className="w-[18%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.eventId} className="hover:bg-muted/20">
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.eventId)}
                        onCheckedChange={() => toggleRow(row.eventId)}
                        aria-label={`Select ${row.title}`}
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-body-sm font-medium text-foreground">
                        {row.title}
                      </p>
                      <p className="text-label-xs text-muted-foreground">
                        {row.categoryName ?? "Uncategorised"}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-label-sm text-muted-foreground">
                      {formatDateIST(row.startsAt)}
                    </TableCell>
                    <TableCell className="py-3 text-center text-label-sm text-muted-foreground">
                      {row.categoryDefaultHours}h
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={200}
                          step={0.5}
                          value={
                            draftHours[row.eventId] ?? row.categoryDefaultHours
                          }
                          onChange={(event) =>
                            setDraftHours((current) => ({
                              ...current,
                              [row.eventId]: Number(event.target.value),
                            }))
                          }
                          aria-label={`Hours for ${row.title}`}
                          className="h-8 w-20 border-border bg-background text-label-sm"
                        />
                        <span className="text-label-xs text-muted-foreground">
                          h
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center text-label-sm text-foreground">
                      {row.presentCount}
                    </TableCell>
                    <TableCell className="py-3">
                      {row.approved ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 bg-success-container/60 text-[11px] text-success"
                        >
                          {row.hours}h approved
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/30 bg-warning-container/60 text-[11px] text-warning"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={recomputeOpen}
        onOpenChange={setRecomputeOpen}
        title={`Recompute hours for ${academicYear}?`}
        description="This rebuilds event and adjustment hours for every volunteer, then rewrites allocated hours in one transaction. Legacy imported hours are never touched, and a purged year is refused."
        confirmLabel="Recompute now"
        onConfirm={handleRecompute}
      />
    </div>
  );
}
