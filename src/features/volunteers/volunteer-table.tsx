"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

export function VolunteerTable({ initialVolunteers }: VolunteerTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state synchronization
  const searchParam = searchParams.get("search") ?? "";
  const projectParam = searchParams.get("project") ?? "ALL";
  const domainParam = searchParams.get("domain") ?? "ALL";
  const statusParam = searchParams.get("status") ?? "ALL";
  const yearParam = searchParams.get("year") ?? "ALL";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  // Local interactive filter state
  const [search, setSearch] = React.useState(searchParam);
  const [project, setProject] = React.useState(projectParam);
  const [domain, setDomain] = React.useState(domainParam);
  const [status, setStatus] = React.useState(statusParam);
  const [year, setYear] = React.useState(yearParam);
  const [currentPage, setCurrentPage] = React.useState(pageParam);
  const [pageSize] = React.useState(8);

  // Sorting
  const [sortField, setSortField] = React.useState<"name" | "rollNumber" | "allocatedHours" | "attendanceRateEvents">("name");
  const [sortAsc, setSortAsc] = React.useState(true);

  // Sync state to URL search parameters on changes
  const updateUrlParams = React.useCallback(
    (newSearch: string, newProj: string, newDom: string, newStat: string, newYr: string, newPg: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newProj !== "ALL") params.set("project", newProj);
      if (newDom !== "ALL") params.set("domain", newDom);
      if (newStat !== "ALL") params.set("status", newStat);
      if (newYr !== "ALL") params.set("year", newYr);
      if (newPg > 1) params.set("page", String(newPg));

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    updateUrlParams(val, project, domain, status, year, 1);
  };

  const handleProjectChange = (val: string) => {
    setProject(val);
    setCurrentPage(1);
    updateUrlParams(search, val, domain, status, year, 1);
  };

  const handleDomainChange = (val: string) => {
    setDomain(val);
    setCurrentPage(1);
    updateUrlParams(search, project, val, status, year, 1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
    updateUrlParams(search, project, domain, val, year, 1);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    setCurrentPage(1);
    updateUrlParams(search, project, domain, status, val, 1);
  };

  const resetFilters = () => {
    setSearch("");
    setProject("ALL");
    setDomain("ALL");
    setStatus("ALL");
    setYear("ALL");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    Boolean(search) || project !== "ALL" || domain !== "ALL" || status !== "ALL" || year !== "ALL";

  // Filtered dataset
  const filtered = React.useMemo(() => {
    return initialVolunteers.filter((v) => {
      // Text search
      if (search) {
        const q = search.toLowerCase().trim();
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
      if (domain !== "ALL" && domain !== "NONE" && !v.domains.includes(domain as CreativeDomain)) {
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
  }, [initialVolunteers, search, project, domain, status, year]);

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
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
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
        </div>

        {/* Dropdown / Select Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/40">
          {/* Project Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground">Project</label>
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
            <label className="text-[11px] font-medium text-muted-foreground">Creative Domain</label>
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
            <label className="text-[11px] font-medium text-muted-foreground">Academic Year</label>
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
            <label className="text-[11px] font-medium text-muted-foreground">Enrollment Status</label>
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
        <span>
          Showing <strong className="font-mono text-foreground">{paginated.length}</strong> of{" "}
          <strong className="font-mono text-foreground">{totalItems}</strong> matching volunteers
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
            <Button size="sm" variant="outline" onClick={resetFilters} className="text-xs">
              Clear All Filters
            </Button>
          }
          className="py-12 bg-card border border-border/70 rounded-xl"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[240px]">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1 hover:text-foreground text-xs font-semibold"
                    >
                      Volunteer
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <button
                      onClick={() => toggleSort("rollNumber")}
                      className="flex items-center gap-1 hover:text-foreground text-xs font-semibold"
                    >
                      Roll No.
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[130px]">Project</TableHead>
                  <TableHead>Creative Domains</TableHead>
                  <TableHead className="w-[90px] text-center">Year</TableHead>
                  <TableHead className="w-[110px] text-right">
                    <button
                      onClick={() => toggleSort("allocatedHours")}
                      className="inline-flex items-center gap-1 hover:text-foreground text-xs font-semibold ml-auto"
                    >
                      Hours
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[110px] text-right">
                    <button
                      onClick={() => toggleSort("attendanceRateEvents")}
                      className="inline-flex items-center gap-1 hover:text-foreground text-xs font-semibold ml-auto"
                    >
                      Turnout
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px] text-center">Status</TableHead>
                  <TableHead className="w-[70px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((vol) => {
                  const projColor = (vol.project && PROJECT_COLOR_MAP[vol.project]?.light) || "bg-primary/10 text-primary";

                  return (
                    <TableRow
                      key={vol.rollNumber}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Name & Role */}
                      <TableCell className="font-medium">
                        <Link
                          href={`/volunteers/${vol.rollNumber}`}
                          className="hover:text-primary transition-colors block"
                        >
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {vol.name}
                            {vol.officeRole && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
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
                      <TableCell className="font-mono text-xs text-foreground font-medium">
                        {vol.rollNumber}
                      </TableCell>

                      {/* Project Affiliation */}
                      <TableCell>
                        {vol.project ? (
                          <Link
                            href={`/projects/${vol.project.toLowerCase()}`}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium transition-opacity hover:opacity-80 ${projColor}`}
                          >
                            {vol.project}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Creative Domains */}
                      <TableCell>
                        {vol.domains.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">General</span>
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
                      <TableCell className="text-center font-mono text-xs">
                        Year {vol.year}
                      </TableCell>

                      {/* Service Hours */}
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {vol.allocatedHours} hrs
                      </TableCell>

                      {/* Turnout Rate */}
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {vol.attendanceRateEvents ?? 0}%
                      </TableCell>

                      {/* Status & Red Flags */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <StatusBadge status={vol.status} type="volunteer" showDot className="text-[10px] py-0 px-2" />
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
                          href={`/volunteers/${vol.rollNumber}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 w-7 p-0 opacity-70 group-hover:opacity-100",
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

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-2.5">
            {paginated.map((vol) => {
              const projColor = (vol.project && PROJECT_COLOR_MAP[vol.project]?.light) || "bg-primary/10 text-primary";

              return (
                <Link
                  key={vol.rollNumber}
                  href={`/volunteers/${vol.rollNumber}`}
                  className="block p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-colors shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{vol.name}</span>
                        {vol.officeRole && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1">
                            {vol.officeRole}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        Roll: {vol.rollNumber} • Year {vol.year}
                      </div>
                    </div>
                    <StatusBadge status={vol.status} type="volunteer" showDot className="text-[10px] py-0 px-2 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-border/40">
                    {vol.project ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${projColor}`}>
                        {vol.project}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Unassigned</span>
                    )}
                    {vol.domains.map((dom) => (
                      <Badge key={dom} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {dom.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground font-mono">
                    <span>
                      Hours: <strong className="text-foreground">{vol.allocatedHours} hrs</strong>
                    </span>
                    <span>
                      Turnout: <strong className="text-emerald-600 dark:text-emerald-400">{vol.attendanceRateEvents ?? 0}%</strong>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-1">
              <span className="text-xs text-muted-foreground">
                Page <strong className="text-foreground font-mono">{pageIndex}</strong> of{" "}
                <strong className="text-foreground font-mono">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, pageIndex - 1);
                    setCurrentPage(newPage);
                    updateUrlParams(search, project, domain, status, year, newPage);
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
                    updateUrlParams(search, project, domain, status, year, newPage);
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
        </>
      )}
    </div>
  );
}
