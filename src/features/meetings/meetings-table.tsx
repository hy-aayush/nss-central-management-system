"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Globe2,
  Hammer,
  MapPin,
  Search,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatClockTimeIST, formatDateIST } from "@/lib/time";
import type { MeetingStatus, MeetingType } from "@/types/event";
import type { MeetingListItem } from "@/lib/mock-data/meetings";

interface MeetingsTableProps {
  initialMeetings: MeetingListItem[];
}

const TYPE_META: Record<
  MeetingType,
  { label: string; icon: typeof Globe2; className: string }
> = {
  CENTRAL: {
    label: "Central",
    icon: Globe2,
    className: "border-primary/20 bg-primary/[0.07] text-primary",
  },
  PROJECT: {
    label: "Project",
    icon: Building2,
    className: "border-info/20 bg-info-container/60 text-on-info-container",
  },
  BUILDERS: {
    label: "Builders",
    icon: Hammer,
    className: "border-warning/25 bg-warning-container/60 text-warning",
  },
};

export function MeetingsTable({ initialMeetings }: MeetingsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MeetingType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "ALL">(
    "ALL",
  );

  const filtered = useMemo(() => {
    let list = [...initialMeetings];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.meeting.agenda.toLowerCase().includes(query) ||
          item.meeting.venue.toLowerCase().includes(query) ||
          (item.meeting.project ?? "").toLowerCase().includes(query),
      );
    }
    if (typeFilter !== "ALL") {
      list = list.filter((item) => item.meeting.type === typeFilter);
    }
    if (statusFilter !== "ALL") {
      list = list.filter((item) => item.meeting.status === statusFilter);
    }

    return list.sort(
      (a, b) =>
        b.meeting.date.localeCompare(a.meeting.date) ||
        b.meeting.startTime.localeCompare(a.meeting.startTime),
    );
  }, [initialMeetings, search, typeFilter, statusFilter]);

  const hasFilters =
    search.trim() !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agenda, venue or project…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9.5 border-border bg-card pl-9 text-body-sm"
            aria-label="Search meetings"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              value && setTypeFilter(value as MeetingType | "ALL")
            }
          >
            <SelectTrigger className="h-9.5 w-[140px] border-border bg-card text-label-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="CENTRAL">Central</SelectItem>
              <SelectItem value="PROJECT">Project</SelectItem>
              <SelectItem value="BUILDERS">Builders</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              value && setStatusFilter(value as MeetingStatus | "ALL")
            }
          >
            <SelectTrigger className="h-9.5 w-[150px] border-border bg-card text-label-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="h-9.5 px-2.5 text-label-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <p className="px-1 text-label-sm text-muted-foreground">
        {filtered.length} meeting{filtered.length === 1 ? "" : "s"} shown
      </p>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-xs md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[38%]">Meeting</TableHead>
              <TableHead className="w-[18%]">Date &amp; time</TableHead>
              <TableHead className="w-[14%]">Venue</TableHead>
              <TableHead className="w-[14%] text-center">Attendance</TableHead>
              <TableHead className="w-[10%]">Minutes</TableHead>
              <TableHead className="w-[6%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={CalendarDays}
                    title="No meetings match these filters"
                    description="Try another type or status, or clear the search."
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(({ meeting, counts }) => {
                const meta = TYPE_META[meeting.type];
                const TypeIcon = meta.icon;

                return (
                  <TableRow
                    key={meeting.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3.5 align-top">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            prefetch={false}
                            href={`/meetings/${meeting.id}`}
                            className="line-clamp-2 text-body-sm font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {meeting.agenda}
                          </Link>
                          <StatusBadge status={meeting.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-label-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-[1.125rem] px-1.5 py-0 text-[0.625rem] font-medium",
                              meta.className,
                            )}
                          >
                            <TypeIcon className="mr-1 size-2.5" />
                            {meta.label}
                            {meeting.type === "PROJECT" && meeting.project
                              ? ` · ${meeting.project}`
                              : ""}
                          </Badge>
                          {meeting.needsReview && (
                            <span className="font-medium text-warning">
                              Needs review
                            </span>
                          )}
                          {meeting.isFinalized && <span>Finalised</span>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 align-top">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-label-sm font-medium text-foreground">
                          <CalendarDays className="size-3.5 text-muted-foreground" />
                          {formatDateIST(`${meeting.date}T00:00:00+05:30`)}
                        </div>
                        <div className="flex items-center gap-1.5 text-label-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatClockTimeIST(meeting.startTime)}
                          {meeting.endTime
                            ? ` – ${formatClockTimeIST(meeting.endTime)}`
                            : ""}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 align-top">
                      <div className="flex items-start gap-1.5 text-label-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        <span className="line-clamp-2">{meeting.venue}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 text-center align-top">
                      <span className="text-body-sm font-semibold text-foreground">
                        {counts.present}/{counts.eligible || counts.audience}
                      </span>
                      <span className="block text-label-xs text-muted-foreground">
                        {counts.eligible > 0
                          ? "Present / eligible"
                          : "No rows yet"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 align-top">
                      {meeting.mom ? (
                        <span className="inline-flex items-center gap-1 text-label-xs font-medium text-success">
                          <FileText className="size-3" />
                          Recorded
                        </span>
                      ) : meeting.status === "COMPLETED" ? (
                        <span className="text-label-xs font-medium text-warning">
                          Due
                        </span>
                      ) : (
                        <span className="text-label-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-right align-top">
                      <Link
                        prefetch={false}
                        href={`/meetings/${meeting.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 px-2.5 text-label-xs",
                        )}
                      >
                        Open
                        <ChevronRight className="ml-1 size-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <CalendarDays className="mx-auto mb-2 size-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No meetings match</p>
            <p className="text-body-sm text-muted-foreground">
              Try clearing the filters.
            </p>
          </Card>
        ) : (
          filtered.map(({ meeting, counts }) => {
            const meta = TYPE_META[meeting.type];
            return (
              <Card key={meeting.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-[1.125rem] px-1.5 py-0 text-[0.625rem] font-medium",
                        meta.className,
                      )}
                    >
                      {meta.label}
                      {meeting.type === "PROJECT" && meeting.project
                        ? ` · ${meeting.project}`
                        : ""}
                    </Badge>
                    <Link
                      prefetch={false}
                      href={`/meetings/${meeting.id}`}
                      className="block text-body-sm font-medium text-foreground"
                    >
                      {meeting.agenda}
                    </Link>
                  </div>
                  <StatusBadge status={meeting.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-surface-container-low/50 p-2.5 text-label-xs text-muted-foreground">
                  <div>
                    <span className="block text-muted-foreground/70">
                      Date &amp; time
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDateIST(`${meeting.date}T00:00:00+05:30`)},{" "}
                      {formatClockTimeIST(meeting.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground/70">
                      Attendance
                    </span>
                    <span className="font-medium text-foreground">
                      {counts.present}/{counts.eligible || counts.audience}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-1">
                  <span className="text-label-xs text-muted-foreground">
                    {meeting.mom
                      ? "Minutes recorded"
                      : meeting.status === "COMPLETED"
                        ? "Minutes due"
                        : "No minutes yet"}
                  </span>
                  <Link
                    prefetch={false}
                    href={`/meetings/${meeting.id}`}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "h-7.5 px-2.5 text-label-xs",
                    )}
                  >
                    Open meeting
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
