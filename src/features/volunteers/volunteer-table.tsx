"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/use-url-sync";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIntentPrefetch } from "@/hooks/use-intent-prefetch";
import { useWarmPage } from "@/hooks/use-warm-page";
import { useImeValue } from "@/hooks/use-ime-value";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ColumnsMenu,
  type ColumnSpec,
} from "@/components/shared/columns-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowRight,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { VolunteerDetail } from "@/types/volunteer";
import type { ProjectName, CreativeDomain } from "@/types/project";
import { PROJECT_COLOR_MAP } from "@/lib/constants";
import {
  readDirection,
  readPage,
  readPageSize,
  readList,
  readSort,
  readText,
} from "@/lib/table-params";

interface VolunteerTableProps {
  initialVolunteers: VolunteerDetail[];
}

const PROJECTS: ProjectName[] = [
  "Bandhutva",
  "Dhara",
  "Nidaan",
  "Riddhi",
  "Swet",
  "Sanyukt",
  "Sparsh",
  "Udaan",
  "Urja",
];

const DOMAINS = [
  { value: "ALL", label: "All Domains" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VIDEO_EDITING", label: "Video Editing" },
  { value: "GRAPHIC_DESIGNING", label: "Graphic Designing" },
  { value: "CONTENT_WRITING", label: "Content Writing" },
  { value: "NONE", label: "No Domain Specialization" },
];

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ARCHIVED", label: "Archived" },
];

const YEARS = [
  { value: "ALL", label: "All Academic Years" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

type SortField =
  | "name"
  | "rollNumber"
  | "allocatedHours"
  | "attendanceRateEvents";

/** The only page sizes the select offers, and the only ones URL state accepts. */
const VOLUNTEER_PAGE_SIZES = [8, 16, 32] as const;

/**
 * The table's columns, in render order.
 *
 * Declared once so the header, the body and the visibility menu cannot disagree
 * about what exists. `name` is locked because it is the row's identity: a table
 * of hours with no name is not a narrower view, it is an unreadable one.
 */
const VOLUNTEER_COLUMNS: ColumnSpec[] = [
  { id: "name", label: "Volunteer", locked: true },
  { id: "roll", label: "Roll number" },
  { id: "project", label: "Project" },
  { id: "domains", label: "Creative domains" },
  { id: "year", label: "Academic year" },
  { id: "hours", label: "Service hours" },
  { id: "turnout", label: "Turnout" },
  { id: "status", label: "Status" },
];

const HIDEABLE_COLUMNS = VOLUNTEER_COLUMNS.map((column) => column.id);

type TableQuery = {
  search: string;
  project: string;
  domain: string;
  status: string;
  year: string;
  page: number;
  sort: SortField;
  asc: boolean;
  size: number;
  hide: string;
};

export function VolunteerTable({ initialVolunteers }: VolunteerTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncUrl = useUrlSync();
  // The card list and the table are two presentations of the same rows. Only
  // one of them is mounted: the table is what the server renders (desktop is
  // the primary office context), and the card list is added on a small screen
  // after mount. Previously both were always in the DOM, so every row was
  // serialised, hydrated and laid out twice.
  const isMobile = useIsMobile();
  // Rows are not prefetched on sight; aiming at one warms it (see the hook).
  const intentPrefetch = useIntentPrefetch();

  // URL state synchronization
  const searchParam = readText(searchParams, "search");
  const projectParam = readText(searchParams, "project", "ALL");
  const domainParam = readText(searchParams, "domain", "ALL");
  const statusParam = readText(searchParams, "status", "ALL");
  const yearParam = readText(searchParams, "year", "ALL");
  const pageParam = readPage(searchParams);
  const sizeParam = readPageSize(searchParams, VOLUNTEER_PAGE_SIZES, 8);
  const initialSort = readSort<SortField>(
    searchParams,
    ["name", "rollNumber", "allocatedHours", "attendanceRateEvents"],
    "name",
  );
  const initialAsc = readDirection(searchParams, "asc") === "asc";

  // Local interactive filter state
  const [search, setSearch] = React.useState(searchParam);
  const [project, setProject] = React.useState(projectParam);
  const [domain, setDomain] = React.useState(domainParam);
  const [status, setStatus] = React.useState(statusParam);
  const [year, setYear] = React.useState(yearParam);
  const [currentPage, setCurrentPage] = React.useState(pageParam);
  const [pageSize, setPageSize] = React.useState(sizeParam);

  // Column visibility lives in the URL (`?hide=domains,year`) so a table someone
  // trimmed for a screen-share comes back trimmed on reload and on a shared link.
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>(() =>
    readList(searchParams, "hide", HIDEABLE_COLUMNS),
  );
  const isVisible = (id: string) => !hiddenColumns.includes(id);

  // Sorting
  const [sortField, setSortField] = React.useState<SortField>(initialSort);
  const [sortAsc, setSortAsc] = React.useState(initialAsc);

  // Filters and view state live in local state; the URL is updated behind them
  // purely so a filtered, sorted view can be shared or restored. That write is
  // debounced and does not go through the router, so typing never triggers a
  // server render or a second access-gate query (see useUrlSync). One `commit`
  // merges a partial view over the current one, so every control persists the
  // whole view instead of its own column of arguments.
  const view = {
    search,
    project,
    domain,
    status,
    year,
    page: currentPage,
    sort: sortField,
    asc: sortAsc,
    size: pageSize,
    hide: hiddenColumns.join(","),
  };

  // One serializer for "this view as a URL", so the address bar and the link the
  // idle prefetch warms can never describe two different tables.
  const queryFor = React.useCallback((merged: TableQuery) => {
    const params = new URLSearchParams();
    if (merged.search) params.set("search", merged.search);
    if (merged.project !== "ALL") params.set("project", merged.project);
    if (merged.domain !== "ALL") params.set("domain", merged.domain);
    if (merged.status !== "ALL") params.set("status", merged.status);
    if (merged.year !== "ALL") params.set("year", merged.year);
    if (merged.page > 1) params.set("page", String(merged.page));
    if (merged.sort !== "name") params.set("sort", merged.sort);
    if (!merged.asc) params.set("dir", "desc");
    if (merged.size !== 8) params.set("size", String(merged.size));
    if (merged.hide) params.set("hide", merged.hide);
    return params.toString();
  }, []);

  const commit = React.useCallback(
    (next: Partial<TableQuery>) => {
      const query = queryFor({ ...view, ...next });
      syncUrl(query ? `${pathname}?${query}` : pathname);
    },
    // `view` is rebuilt on every render from the state above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      pathname,
      syncUrl,
      queryFor,
      search,
      project,
      domain,
      status,
      year,
      currentPage,
      sortField,
      sortAsc,
      pageSize,
      hiddenColumns,
    ],
  );

  // The input follows the keystroke; the filter pass waits for an IME.
  const imeSearch = useImeValue((value) => {
    setSearch(value);
    setCurrentPage(1);
    commit({ search: value, page: 1 });
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    imeSearch.settled(val);
  };

  const handleProjectChange = (val: string) => {
    setProject(val);
    setCurrentPage(1);
    commit({ project: val, page: 1 });
  };

  const handleDomainChange = (val: string) => {
    setDomain(val);
    setCurrentPage(1);
    commit({ domain: val, page: 1 });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
    commit({ status: val, page: 1 });
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    setCurrentPage(1);
    commit({ year: val, page: 1 });
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
    commit({ size: val, page: 1 });
  };

  const resetFilters = () => {
    setSearch("");
    setProject("ALL");
    setDomain("ALL");
    setStatus("ALL");
    setYear("ALL");
    setCurrentPage(1);
    // Reset clears the filters, not the columns: someone who hid four columns
    // to read this table did not ask for them back.
    commit({ search: "", project: "ALL", domain: "ALL", status: "ALL", year: "ALL", page: 1 });
  };

  const handleColumnsChange = (next: string[]) => {
    setHiddenColumns(next);
    commit({ hide: next.join(",") });
  };

  const hasActiveFilters =
    Boolean(search) ||
    project !== "ALL" ||
    domain !== "ALL" ||
    status !== "ALL" ||
    year !== "ALL";

  // The text box and the table are decoupled: the input updates immediately,
  // while the (potentially large) filter pass runs on a deferred copy. On a
  // slow device this is the difference between typing at keystroke speed and
  // typing at render speed.
  const deferredSearch = React.useDeferredValue(search);

  // Filtered dataset
  const filtered = React.useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return initialVolunteers.filter((v) => {
      // Text search
      if (query) {
        const q = query;
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesRoll = v.rollNumber.toLowerCase().includes(q);
        const matchesEmail = v.email.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesEmail) return false;
      }

      // Project filter
      if (project !== "ALL" && v.project !== project) {
        return false;
      }

      // Domain filter
      if (domain === "NONE" && v.domains.length > 0) {
        return false;
      }
      if (
        domain !== "ALL" &&
        domain !== "NONE" &&
        !v.domains.includes(domain as CreativeDomain)
      ) {
        return false;
      }

      // Status filter
      if (status !== "ALL" && v.status !== status) {
        return false;
      }

      // Academic Year filter
      if (year !== "ALL" && String(v.year) !== year) {
        return false;
      }

      return true;
    });
  }, [initialVolunteers, deferredSearch, project, domain, status, year]);

  // Sort filtered dataset
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "rollNumber") {
        cmp = a.rollNumber.localeCompare(b.rollNumber);
      } else if (sortField === "allocatedHours") {
        cmp = a.allocatedHours - b.allocatedHours;
      } else if (sortField === "attendanceRateEvents") {
        cmp = (a.attendanceRateEvents ?? 0) - (b.attendanceRateEvents ?? 0);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination calculation
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIndex = (pageIndex - 1) * pageSize;
  // The next page of this exact view, serialized by the same function that
  // writes the address bar (see `queryFor`).
  const nextPageHref =
    pageIndex < totalPages
      ? `${pathname}?${queryFor({ ...view, page: pageIndex + 1 })}`
      : null;
  const warmNextPage = useWarmPage(nextPageHref);
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  // Mirrors the visible arrow so a screen reader announces "sorted ascending"
  // on the column that is actually ordering the rows.
  const sortDirection = (field: SortField) =>
    sortField === field ? (sortAsc ? "ascending" : "descending") : "none";

  const toggleSort = (field: SortField) => {
    const nextAsc = sortField === field ? !sortAsc : true;
    setSortField(field);
    setSortAsc(nextAsc);
    setCurrentPage(1);
    commit({ sort: field, asc: nextAsc, page: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by student name, roll number, or KIIT email..."
              value={search}
              onChange={handleSearchChange}
              {...imeSearch.compositionProps}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Quick Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground self-start md:self-auto gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}

          {/* Column visibility is a desktop concern: the small-screen view is a
              card list, which has no columns to hide. */}
          <div className="hidden md:block">
            <ColumnsMenu
              columns={VOLUNTEER_COLUMNS}
              hidden={hiddenColumns}
              onChange={handleColumnsChange}
            />
          </div>
        </div>

        {/* Dropdown / Select Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/40">
          {/* Project Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All 9 Projects</option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Creative Domain
            </label>
            <select
              value={domain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Enrollment Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span role="status" aria-live="polite" aria-atomic="true">
          Showing{" "}
          <strong className="font-mono text-foreground">
            {paginated.length}
          </strong>{" "}
          of <strong className="font-mono text-foreground">{totalItems}</strong>{" "}
          matching volunteers
        </span>
        {hasActiveFilters && (
          <span className="flex items-center gap-1.5 text-primary text-[11px]">
            <Filter className="h-3 w-3" />
            Filtered view
          </span>
        )}
      </div>

      {/* Empty State */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Volunteers Found"
          description="No volunteer records match your search criteria. Try modifying your search keywords or clearing active filters."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={resetFilters}
              className="text-xs"
            >
              Clear All Filters
            </Button>
          }
          className="py-12 bg-card border border-border/70 rounded-xl"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--elevation-1)] md:block">
            <Table>
              <TableCaption className="sr-only">
                Volunteer directory, sorted by {sortField} {sortAsc ? "ascending" : "descending"}
              </TableCaption>
              <TableHeader className="bg-surface-container-low/60">
                <TableRow>
                  <TableHead
                    aria-sort={sortDirection("name")}
                    className="h-9 w-[240px] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase"
                  >
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1 rounded-sm text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors duration-150 ease-[var(--ease-out-quart)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      Volunteer
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead
                    aria-sort={sortDirection("rollNumber")}
                    className={`h-9 w-[120px] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("roll") ? "" : "hidden"}`}
                  >
                    <button
                      onClick={() => toggleSort("rollNumber")}
                      className="flex items-center gap-1 rounded-sm text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors duration-150 ease-[var(--ease-out-quart)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      Roll No.
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className={`h-9 w-[130px] text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("project") ? "" : "hidden"}`}>
                    Project
                  </TableHead>
                  <TableHead className={`h-9 text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("domains") ? "" : "hidden"}`}>
                    Creative Domains
                  </TableHead>
                  <TableHead className={`h-9 w-[90px] text-center text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("year") ? "" : "hidden"}`}>
                    Year
                  </TableHead>
                  <TableHead
                    aria-sort={sortDirection("allocatedHours")}
                    className={`h-9 w-[110px] text-right text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("hours") ? "" : "hidden"}`}
                  >
                    <button
                      onClick={() => toggleSort("allocatedHours")}
                      className="ml-auto inline-flex items-center gap-1 rounded-sm text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors duration-150 ease-[var(--ease-out-quart)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      Hours
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead
                    aria-sort={sortDirection("attendanceRateEvents")}
                    className={`h-9 w-[110px] text-right text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("turnout") ? "" : "hidden"}`}
                  >
                    <button
                      onClick={() => toggleSort("attendanceRateEvents")}
                      className="ml-auto inline-flex items-center gap-1 rounded-sm text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors duration-150 ease-[var(--ease-out-quart)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      Turnout
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className={`h-9 w-[100px] text-center text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase ${isVisible("status") ? "" : "hidden"}`}>
                    Status
                  </TableHead>
                  <TableHead className="h-9 w-[70px] text-right text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((vol) => {
                  const projColor =
                    (vol.project && PROJECT_COLOR_MAP[vol.project]?.light) ||
                    "bg-primary/10 text-primary";

                  return (
                    <TableRow
                      key={vol.rollNumber}
                      className="row-virtual row-focus group transition-colors duration-150 ease-[var(--ease-out-quart)] hover:bg-surface-container-low/50"
                    >
                      {/* Name & Role */}
                      <TableCell className="font-medium">
                        <Link
                          prefetch={false}
                          {...intentPrefetch(`/volunteers/${vol.rollNumber}`)}
                          href={`/volunteers/${vol.rollNumber}`}
                          className="hover:text-primary transition-colors block"
                        >
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {vol.name}
                            {vol.officeRole && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1 font-normal"
                              >
                                {vol.officeRole}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono block truncate">
                            {vol.email}
                          </span>
                        </Link>
                      </TableCell>

                      {/* Roll Number */}
                      <TableCell className={`font-mono text-xs text-foreground font-medium ${isVisible("roll") ? "" : "hidden"}`}>
                        {vol.rollNumber}
                      </TableCell>

                      {/* Project Affiliation */}
                      <TableCell className={isVisible("project") ? undefined : "hidden"}>
                        {vol.project ? (
                          <Link
                            prefetch={false}
                            href={`/projects/${vol.project.toLowerCase()}`}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium transition-opacity hover:opacity-80 ${projColor}`}
                          >
                            {vol.project}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Creative Domains */}
                      <TableCell className={isVisible("domains") ? undefined : "hidden"}>
                        {vol.domains.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            General
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {vol.domains.map((dom) => (
                              <Badge
                                key={dom}
                                variant="secondary"
                                className="text-[10px] font-mono px-1.5 py-0"
                              >
                                {dom.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      {/* Academic Year */}
                      <TableCell className={`text-center font-mono text-xs ${isVisible("year") ? "" : "hidden"}`}>
                        Year {vol.year}
                      </TableCell>

                      {/* Service Hours */}
                      <TableCell className={`text-right font-mono text-xs font-semibold text-foreground ${isVisible("hours") ? "" : "hidden"}`}>
                        {vol.allocatedHours} hrs
                      </TableCell>

                      {/* Turnout Rate */}
                      <TableCell className={`tnum text-right text-[0.75rem] font-medium text-foreground ${isVisible("turnout") ? "" : "hidden"}`}>
                        {vol.attendanceRateEvents ?? 0}%
                      </TableCell>

                      {/* Status & Red Flags */}
                      <TableCell className={`text-center ${isVisible("status") ? "" : "hidden"}`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <StatusBadge
                            status={vol.status}
                            type="volunteer"
                            showDot
                            className="text-[10px] py-0 px-2"
                          />
                          {vol.redFlagsCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive font-mono">
                              <ShieldAlert className="h-2.5 w-2.5" />
                              {vol.redFlagsCount} flag
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Link
                          prefetch={false}
                          href={`/volunteers/${vol.rollNumber}`}
                          {...intentPrefetch(`/volunteers/${vol.rollNumber}`)}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className:
                              "h-7 w-7 p-0 opacity-70 group-hover:opacity-100",
                          })}
                          aria-label={`View ${vol.name}'s profile`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View — mounted only when the viewport is small */}
          {isMobile ? (
            <div className="space-y-2.5 md:hidden">
              {paginated.map((vol) => {
                const projColor =
                  (vol.project && PROJECT_COLOR_MAP[vol.project]?.light) ||
                  "bg-primary/10 text-primary";

                return (
                  <Link
                    key={vol.rollNumber}
                    prefetch={false}
                    href={`/volunteers/${vol.rollNumber}`}
                    className="block p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-colors shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {vol.name}
                          </span>
                          {vol.officeRole && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1"
                            >
                              {vol.officeRole}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          Roll: {vol.rollNumber} • Year {vol.year}
                        </div>
                      </div>
                      <StatusBadge
                        status={vol.status}
                        type="volunteer"
                        showDot
                        className="text-[10px] py-0 px-2 shrink-0"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-border/40">
                      {vol.project ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${projColor}`}
                        >
                          {vol.project}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                      {vol.domains.map((dom) => (
                        <Badge
                          key={dom}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {dom.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground font-mono">
                      <span>
                        Hours:{" "}
                        <strong className="text-foreground">
                          {vol.allocatedHours} hrs
                        </strong>
                      </span>
                      <span>
                        Turnout:{" "}
                        <strong className="text-foreground">
                          {vol.attendanceRateEvents ?? 0}%
                        </strong>
                      </span>
                      <span className="flex items-center gap-0.5 text-primary text-[11px] font-sans font-medium">
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* Pagination Controls */}
          {(totalPages > 1 || pageSize !== 8) && (
            <div className="flex items-center justify-between pt-2 px-1">
              <span className="text-xs text-muted-foreground">
                Page{" "}
                <strong className="text-foreground font-mono">
                  {pageIndex}
                </strong>{" "}
                of{" "}
                <strong className="text-foreground font-mono">
                  {totalPages}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Rows
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    aria-label="Rows per page"
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {VOLUNTEER_PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, pageIndex - 1);
                    setCurrentPage(newPage);
                    commit({ page: newPage });
                  }}
                  disabled={pageIndex <= 1}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(totalPages, pageIndex + 1);
                    setCurrentPage(newPage);
                    commit({ page: newPage });
                  }}
                  disabled={pageIndex >= totalPages}
                  className="h-8 gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* End of the list: once this is within 200px of the viewport the
              next page of the same view is warmed on idle. */}
          <div ref={warmNextPage} aria-hidden className="h-px" />
        </>
      )}
    </div>
  );
}
