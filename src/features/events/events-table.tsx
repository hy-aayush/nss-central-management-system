"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/use-url-sync";
import { useIntentPrefetch } from "@/hooks/use-intent-prefetch";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Globe2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TableCaption,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { EventRecord, EventType, EventStatus } from "@/types/event";
import type { ProjectName } from "@/types/project";
import { PROJECT_NAMES } from "./event-schemas";
import {
  readDirection,
  readEnum,
  readPage,
  readPageSize,
  readSort,
  readText,
} from "@/lib/table-params";

/** Allow-lists for URL state; they mirror the controls rendered below. */
const EVENT_TYPES = ["CENTRAL", "PROJECT"] as const;
const EVENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "ONGOING",
] as const;
const EVENT_PAGE_SIZES = [10, 20, 40] as const;

interface EventsTableProps {
  initialEvents: EventRecord[];
}

export function EventsTable({ initialEvents }: EventsTableProps) {
  const searchParams = useSearchParams();
  const syncUrl = useUrlSync();
  // Row links warm on hover/focus, not on scroll (see the hook).
  const intentPrefetch = useIntentPrefetch();

  // Search & Filter state synced with URL search params
  const [search, setSearch] = useState(readText(searchParams, "search"));
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">(
    readEnum<EventType>(searchParams, "type", EVENT_TYPES, "ALL"),
  );
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">(
    readEnum<EventStatus>(searchParams, "status", EVENT_STATUSES, "ALL"),
  );
  const [projectFilter, setProjectFilter] = useState<ProjectName | "ALL">(
    readEnum<ProjectName>(searchParams, "project", PROJECT_NAMES, "ALL"),
  );
  const [page, setPage] = useState(readPage(searchParams));
  const [sortBy, setSortBy] = useState<"date" | "title" | "attendance">(
    readSort<"date" | "title" | "attendance">(
      searchParams,
      ["date", "title", "attendance"],
      "date",
    ),
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    readDirection(searchParams, "desc"),
  );
  const [pageSize, setPageSize] = useState(
    readPageSize(searchParams, EVENT_PAGE_SIZES, 10),
  );

  // Typing updates the input first; the filter/sort pass follows on a deferred
  // copy so the field never waits for the table work.
  const deferredSearch = useDeferredValue(search);

  // Filter & sort pipeline
  const filteredEvents = useMemo(() => {
    let result = [...initialEvents];

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q),
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter((e) => e.type === typeFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (projectFilter !== "ALL") {
      result = result.filter(
        (e) =>
          e.projectName === projectFilter ||
          e.projects.some((p) => p.projectName === projectFilter),
      );
    }

    // Sort
    result.sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "date") {
        return (
          (new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()) *
          order
        );
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title) * order;
      }
      if (sortBy === "attendance") {
        const aCount = a.presentCount ?? a.presentAttendees ?? 0;
        const bCount = b.presentCount ?? b.presentAttendees ?? 0;
        return (aCount - bCount) * order;
      }
      return 0;
    });

    return result;
  }, [
    initialEvents,
    deferredSearch,
    typeFilter,
    statusFilter,
    projectFilter,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, page, pageSize]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "ALL") current.delete(k);
      else current.set(k, v);
    });
    // Shallow URL write: the table already has its rows, so this must not
    // re-render the server route (which would cost a gate query).
    syncUrl(`?${current.toString()}`);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    updateFilters({ search: val.trim() || null, page: "1" });
  };

  const handleTypeChange = (val: EventType | "ALL" | null) => {
    if (!val) return;
    setTypeFilter(val);
    setPage(1);
    updateFilters({ type: val === "ALL" ? null : val, page: "1" });
  };

  const handleStatusChange = (val: EventStatus | "ALL" | null) => {
    if (!val) return;
    setStatusFilter(val);
    setPage(1);
    updateFilters({ status: val === "ALL" ? null : val, page: "1" });
  };

  const handleProjectChange = (val: ProjectName | "ALL" | null) => {
    if (!val) return;
    setProjectFilter(val);
    setPage(1);
    updateFilters({ project: val === "ALL" ? null : val, page: "1" });
  };

  const toggleSort = (field: "date" | "title" | "attendance") => {
    const nextOrder: "asc" | "desc" =
      sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "desc";
    setSortBy(field);
    setSortOrder(nextOrder);
    updateFilters({
      sort: field === "date" ? null : field,
      dir: nextOrder === "desc" ? null : "asc",
    });
  };

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPage(1);
    updateFilters({ size: next === 10 ? null : String(next), page: "1" });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, description or venue..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-card border-border h-9.5 text-body-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[130px] h-9.5 bg-card border-border text-label-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CENTRAL">Central</SelectItem>
              <SelectItem value="PROJECT">Project Wing</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-9.5 bg-card border-border text-label-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Project Filter */}
          <Select value={projectFilter} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[140px] h-9.5 bg-card border-border text-label-sm">
              <SelectValue placeholder="All Wings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Wings</SelectItem>
              {PROJECT_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search ||
            typeFilter !== "ALL" ||
            statusFilter !== "ALL" ||
            projectFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
                setProjectFilter("ALL");
                setPage(1);
                updateFilters({
                  search: null,
                  type: null,
                  status: null,
                  project: null,
                  page: "1",
                });
              }}
              className="text-muted-foreground hover:text-foreground text-label-sm h-9.5 px-2.5"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count & Sort Indicators */}
      <div className="flex items-center justify-between text-label-sm text-muted-foreground px-1">
        <span role="status" aria-live="polite" aria-atomic="true">
          Showing {filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, filteredEvents.length)} of{" "}
          {filteredEvents.length} events
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort("date")}
            className={`h-7 px-2 text-label-xs ${sortBy === "date" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Date
            <ArrowUpDown className="size-3 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort("title")}
            className={`h-7 px-2 text-label-xs ${sortBy === "title" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Title
            <ArrowUpDown className="size-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--elevation-1)] md:block">
        <Table>
          <TableCaption className="sr-only">
            Events, sorted by {sortBy} {sortOrder === "asc" ? "ascending" : "descending"}
          </TableCaption>
          <TableHeader className="bg-surface-container-low/60">
            <TableRow>
              <TableHead className="h-9 w-[38%] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Event &amp; Scope
              </TableHead>
              <TableHead className="h-9 w-[20%] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Date &amp; Time (IST)
              </TableHead>
              <TableHead className="h-9 w-[18%] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Venue
              </TableHead>
              <TableHead className="h-9 w-[12%] text-center text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Roster / Turnout
              </TableHead>
              <TableHead className="h-9 w-[12%] text-right text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-40 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="size-8 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">
                      No matching events found
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      Try relaxing your search terms or clearing status filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => {
                const isCentral = event.type === "CENTRAL";
                const isCompleted = event.status === "COMPLETED";
                const primaryWing =
                  event.projectName ??
                  (event.projects[0]?.projectName || "All Wings");
                const turnout =
                  event.presentCount && event.registeredCount
                    ? `${event.presentCount}/${event.registeredCount}`
                    : event.expectedAttendees
                      ? `~${event.expectedAttendees}`
                      : "—";

                return (
                  <TableRow
                    key={event.id}
                    className="row-focus transition-colors duration-150 ease-[var(--ease-out-quart)] hover:bg-surface-container-low/50"
                  >
                    {/* Event Title & Metadata */}
                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            prefetch={false}
                            {...intentPrefetch(`/events/${event.id}`)}
                            href={`/events/${event.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors text-body-sm line-clamp-1"
                          >
                            {event.title}
                          </Link>
                          <StatusBadge status={event.status} />
                        </div>
                        <div className="flex items-center gap-2 text-label-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={`h-[1.125rem] border px-1.5 py-0 text-[0.625rem] font-medium ${
                              isCentral
                                ? "border-primary/20 bg-primary/[0.07] text-primary"
                                : "border-info/20 bg-info-container/60 text-on-info-container"
                            }`}
                          >
                            {isCentral ? (
                              <Globe2 className="size-2.5 mr-1 inline" />
                            ) : (
                              <Building2 className="size-2.5 mr-1 inline" />
                            )}
                            {isCentral ? "Central" : primaryWing}
                          </Badge>
                          {event.category && (
                            <span>• {event.category.name}</span>
                          )}
                          {event.hours && (
                            <span className="text-primary font-medium">
                              • {event.hours}h credit
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date and Time */}
                    <TableCell className="align-top py-3.5 text-body-sm text-muted-foreground">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-foreground font-medium text-label-sm">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{formatDateIST(event.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-label-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{formatTimeIST(event.startsAt)}</span>
                          {event.endsAt && (
                            <span>– {formatTimeIST(event.endsAt)}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Venue */}
                    <TableCell className="align-top py-3.5 text-body-sm text-muted-foreground">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-label-sm">
                          {event.venue}
                        </span>
                      </div>
                    </TableCell>

                    {/* Roster / Turnout */}
                    <TableCell className="align-top py-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-body-sm font-semibold text-foreground">
                          {turnout}
                        </span>
                        <span className="text-label-xs text-muted-foreground">
                          {isCompleted ? "Attended" : "Slots / Roster"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-top py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          prefetch={false}
                          href={`/events/${event.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-8 px-2.5 text-label-xs",
                          )}
                        >
                          View
                        </Link>
                        <Link
                          prefetch={false}
                          href={`/attendance?eventId=${event.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-8 px-2 text-label-xs text-primary hover:bg-primary/10",
                          )}
                        >
                          <UserCheck className="size-3.5 mr-1" />
                          Attendance
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedEvents.length === 0 ? (
          <Card className="p-8 text-center bg-card border-dashed">
            <Calendar className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-medium text-foreground">No matching events</p>
            <p className="text-body-sm text-muted-foreground">
              Try clearing filters or search terms.
            </p>
          </Card>
        ) : (
          paginatedEvents.map((event) => {
            const isCentral = event.type === "CENTRAL";
            const primaryWing =
              event.projectName ??
              (event.projects[0]?.projectName || "All Wings");

            return (
              <Card key={event.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={`h-[1.125rem] border px-1.5 py-0 text-[0.625rem] font-medium ${
                        isCentral
                          ? "border-primary/20 bg-primary/[0.07] text-primary"
                          : "border-info/20 bg-info-container/60 text-on-info-container"
                      }`}
                    >
                      {isCentral ? "Central Drive" : primaryWing}
                    </Badge>
                    <Link
                      prefetch={false}
                      href={`/events/${event.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors text-body-sm block line-clamp-2"
                    >
                      {event.title}
                    </Link>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-surface-container-low/50 p-2.5 text-label-xs text-muted-foreground">
                  <div>
                    <span className="text-muted-foreground/70 block">
                      Date &amp; Time
                    </span>
                    <span className="text-foreground font-medium">
                      {formatDateIST(event.startsAt)},{" "}
                      {formatTimeIST(event.startsAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/70 block">
                      Venue
                    </span>
                    <span className="text-foreground font-medium truncate block">
                      {event.venue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-label-xs text-primary font-medium">
                    {event.hours ? `${event.hours} Hours Credit` : "Hours TBD"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      prefetch={false}
                      href={`/events/${event.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-7.5 px-2.5 text-label-xs",
                      )}
                    >
                      Details
                    </Link>
                    <Link
                      prefetch={false}
                      href={`/attendance?eventId=${event.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-7.5 px-2.5 text-label-xs",
                      )}
                    >
                      <UserCheck className="size-3 mr-1" />
                      Roll Call
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {(totalPages > 1 || pageSize !== 10) && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-label-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <label className="mr-1 flex items-center gap-1.5 text-label-xs text-muted-foreground">
              Rows
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                aria-label="Rows per page"
                className="h-8 rounded-md border border-input bg-background px-2 text-label-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {EVENT_PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const newPage = page - 1;
                setPage(newPage);
                updateFilters({ page: String(newPage) });
              }}
              className="h-8 px-2.5 text-label-xs"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                const newPage = page + 1;
                setPage(newPage);
                updateFilters({ page: String(newPage) });
              }}
              className="h-8 px-2.5 text-label-xs"
            >
              Next
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
