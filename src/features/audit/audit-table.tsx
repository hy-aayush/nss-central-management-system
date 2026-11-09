"use client";

import { useDeferredValue, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useTableQuery } from "@/hooks/use-table-query";
import { useImeValue } from "@/hooks/use-ime-value";
import { readPage, readText } from "@/lib/table-params";
import {
  Search,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { formatDateIST, formatTimeIST } from "@/lib/time";
import { PROJECT_NAMES } from "@/types/project";
import type { AuditLogEntry } from "@/types/audit";

/**
 * The inspector dialog is only useful after a row click, so its chunk is
 * fetched on that click instead of with the audit table. `AuditDetailDialog`
 * is imported lazily and only mounted while an entry is selected, which keeps
 * the dialog primitives out of the route's first payload.
 */
const AuditDetailDialog = dynamic(
  () =>
    import("./audit-detail-dialog").then((module) => module.AuditDetailDialog),
  { ssr: false },
);

interface AuditTableProps {
  initialLogs: AuditLogEntry[];
}

export function AuditTable({ initialLogs }: AuditTableProps) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(readText(searchParams, "q"));
  const [selectedAction, setSelectedAction] = useState<string>(
    readText(searchParams, "action", "ALL"),
  );
  const [selectedEntity, setSelectedEntity] = useState<string>(
    readText(searchParams, "entity", "ALL"),
  );
  const [selectedProject, setSelectedProject] = useState<string>(
    readText(searchParams, "wing", "ALL"),
  );
  const [selectedOutcome, setSelectedOutcome] = useState<string>(
    readText(searchParams, "outcome", "ALL"),
  );
  const [onlyEmergency, setOnlyEmergency] = useState(
    searchParams.get("emergency") === "1",
  );
  const [page, setPage] = useState(readPage(searchParams));
  const pageSize = 8;

  // The audit view is the one an investigator wants to hand to someone else, so
  // its filters live in the URL (shared hook, debounced, no router render).
  useTableQuery(
    {
      q: "",
      action: "ALL",
      entity: "ALL",
      wing: "ALL",
      outcome: "ALL",
      emergency: "",
      page: "1",
    },
    {
      q: search,
      action: selectedAction,
      entity: selectedEntity,
      wing: selectedProject,
      outcome: selectedOutcome,
      emergency: onlyEmergency ? "1" : "",
      page: String(page),
    },
  );

  const [inspectingEntry, setInspectingEntry] = useState<AuditLogEntry | null>(
    null,
  );

  /**
   * J/K move between ledger rows, Enter opens the focused one.
   *
   * The audit view is read top to bottom looking for one entry, and moving the
   * hand to the mouse between rows breaks that. The handler sits on the table,
   * so it only fires when focus is already inside it, and it steps aside for
   * text fields and for anything with a modifier held — a browser find, a tab
   * switch or a real typed "j" into a filter keeps working.
   */
  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    const rows = [
      ...event.currentTarget.querySelectorAll<HTMLTableRowElement>(
        "tr[data-audit-row]",
      ),
    ];
    if (rows.length === 0) return;

    const active = target.closest<HTMLTableRowElement>("tr[data-audit-row]");
    const index = active ? rows.indexOf(active) : -1;

    if (event.key === "j" || event.key === "k") {
      event.preventDefault();
      const nextIndex =
        event.key === "j"
          ? Math.min(index + 1, rows.length - 1)
          : Math.max(index - 1, 0);
      const next = rows[nextIndex];
      next.focus();
      next.scrollIntoView({ block: "nearest" });
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && active) {
      const entry = paginatedLogs.find((row) => row.id === active.dataset.auditRow);
      if (!entry) return;
      event.preventDefault();
      setInspectingEntry(entry);
    }
  };

  // Input stays instant; the audit set can be large, so its filter pass runs on
  // a deferred copy of the query. An IME composition is not filtered at all
  // until it commits, so a half-typed Devanagari name cannot empty the ledger.
  const imeSearch = useImeValue((value) => {
    setSearch(value);
    setPage(1);
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    imeSearch.settled(e.target.value);
  };

  const deferredSearch = useDeferredValue(search);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    let list = [...initialLogs];

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.actorName && l.actorName.toLowerCase().includes(q)) ||
          (l.actorRoll && l.actorRoll.toLowerCase().includes(q)) ||
          (l.targetRoll && l.targetRoll.toLowerCase().includes(q)) ||
          (l.targetName && l.targetName.toLowerCase().includes(q)) ||
          (l.summary && l.summary.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          (l.entityLabel && l.entityLabel.toLowerCase().includes(q)),
      );
    }

    if (selectedAction !== "ALL") {
      list = list.filter((l) => l.action === selectedAction);
    }

    if (selectedEntity !== "ALL") {
      list = list.filter((l) => l.entityType === selectedEntity);
    }

    if (selectedProject !== "ALL") {
      list = list.filter((l) => l.projectContext === selectedProject);
    }

    if (selectedOutcome !== "ALL") {
      list = list.filter((l) => l.outcome === selectedOutcome);
    }

    if (onlyEmergency) {
      list = list.filter(
        (l) =>
          l.action === "EMERGENCY_ACCESS_GRANT" ||
          l.action === "EMERGENCY_ACCESS_REVOKE" ||
          l.reason?.toLowerCase().includes("emergency"),
      );
    }

    // Default sort: latest timestamp first
    list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return list;
  }, [
    initialLogs,
    deferredSearch,
    selectedAction,
    selectedEntity,
    selectedProject,
    selectedOutcome,
    onlyEmergency,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Unique actions for dropdown
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(initialLogs.map((l) => l.action)));
  }, [initialLogs]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <Card className="p-4 bg-card border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search actor, target roll, reason, or entity..."
              value={search}
              onChange={handleSearchChange}
              {...imeSearch.compositionProps}
              className="pl-9 h-9 text-body-sm bg-background border-border"
            />
          </div>

          {/* Action Filter */}
          <Select
            value={selectedAction}
            onValueChange={(val) => {
              if (val) {
                setSelectedAction(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9 bg-background border-border text-label-xs">
              <SelectValue placeholder="Action: All" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="ALL">All Actions</SelectItem>
              {uniqueActions.map((act) => (
                <SelectItem key={act} value={act}>
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity Type Filter */}
          <Select
            value={selectedEntity}
            onValueChange={(val) => {
              if (val) {
                setSelectedEntity(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9 bg-background border-border text-label-xs">
              <SelectValue placeholder="Entity: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entity Types</SelectItem>
              <SelectItem value="VOLUNTEER">VOLUNTEER</SelectItem>
              <SelectItem value="EVENT">EVENT</SelectItem>
              <SelectItem value="ATTENDANCE">ATTENDANCE</SelectItem>
              <SelectItem value="HOURS">HOURS</SelectItem>
              <SelectItem value="ROSTER">ROSTER</SelectItem>
              <SelectItem value="EXPORT">EXPORT</SelectItem>
              <SelectItem value="SYSTEM">SYSTEM</SelectItem>
            </SelectContent>
          </Select>

          {/* Project Filter */}
          <Select
            value={selectedProject}
            onValueChange={(val) => {
              if (val) {
                setSelectedProject(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9 bg-background border-border text-label-xs">
              <SelectValue placeholder="Wing: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
              {PROJECT_NAMES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Second row: outcome & emergency action toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-label-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Outcome:</span>
            <div className="flex items-center gap-1">
              {["ALL", "SUCCESS", "DENIED"].map((opt) => (
                <Button
                  key={opt}
                  variant={selectedOutcome === opt ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSelectedOutcome(opt);
                    setPage(1);
                  }}
                  className="h-6.5 px-2 text-[11px]"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant={onlyEmergency ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setOnlyEmergency(!onlyEmergency);
              setPage(1);
            }}
            className={`h-7 px-2.5 text-label-xs gap-1.5 ${
              onlyEmergency
                ? "bg-warning hover:bg-warning text-white border-warning/30"
                : "text-warning border-warning/30 hover:bg-warning-container/60"
            }`}
          >
            <ShieldAlert className="size-3.5" />
            <span>Emergency Actions Only</span>
          </Button>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="p-0 bg-card border-border shadow-xs overflow-hidden">
        <Table onKeyDown={handleTableKeyDown}>
          <TableCaption className="sr-only">
            Audit ledger, newest first. Press J and K to move between rows.
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/80">
              <TableHead className="w-44">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timestamp (IST)
                </span>
              </TableHead>
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actor &amp; Role
                </span>
              </TableHead>
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Action &amp; Target
                </span>
              </TableHead>
              <TableHead className="max-w-xs">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Policy Reason / Summary
                </span>
              </TableHead>
              <TableHead className="w-24 text-center">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Outcome
                </span>
              </TableHead>
              <TableHead className="w-16 text-right">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="space-y-1">
                    <FileText className="size-6 text-muted-foreground/40 mx-auto" />
                    <p className="text-body-sm font-medium text-foreground">
                      No matching audit records found
                    </p>
                    <p className="text-label-xs text-muted-foreground">
                      Adjust your query filters or reset the search bar.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((entry) => {
                const isEmergency =
                  entry.action === "EMERGENCY_ACCESS_GRANT" ||
                  entry.action === "EMERGENCY_ACCESS_REVOKE" ||
                  entry.reason?.toLowerCase().includes("emergency");
                const isDenied = entry.outcome === "DENIED";

                return (
                  <TableRow
                    key={entry.id}
                    data-audit-row={entry.id}
                    tabIndex={-1}
                    onClick={() => setInspectingEntry(entry)}
                    className="row-virtual hover:bg-muted/40 transition-colors cursor-pointer group outline-none focus-visible:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    {/* Timestamp */}
                    <TableCell className="text-label-xs text-muted-foreground">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">
                          {formatDateIST(entry.at)}
                        </span>
                        <span className="text-[11px] flex items-center gap-1 font-mono">
                          <Clock className="size-3 text-muted-foreground/70" />
                          {formatTimeIST(entry.at)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actor */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground text-label-sm block">
                          {entry.actorName || "Automated System"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {entry.actorRoll && (
                            <span className="font-mono">{entry.actorRoll}</span>
                          )}
                          {entry.effectiveRole && (
                            <Badge
                              variant="outline"
                              className="px-1 py-0 h-4 text-[9px] uppercase"
                            >
                              {entry.effectiveRole}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Action & Target */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0 h-4.5 text-[10px] font-mono ${
                              isEmergency
                                ? "bg-warning-container/60 text-warning border-warning/30 font-semibold"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {isEmergency ? "EMERGENCY ACTION" : entry.action}
                          </Badge>
                          {entry.projectContext && (
                            <span className="text-[10px] text-muted-foreground">
                              • {entry.projectContext}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block truncate max-w-xs">
                          {entry.entityType}:{" "}
                          {entry.entityLabel || entry.entityId}
                        </span>
                      </div>
                    </TableCell>

                    {/* Summary / Reason */}
                    <TableCell className="max-w-xs">
                      <div className="space-y-0.5">
                        <p className="text-body-sm text-foreground line-clamp-1">
                          {entry.summary}
                        </p>
                        {entry.reason && (
                          <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                            &ldquo;{entry.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Outcome */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0 h-4.5 text-[10px] font-semibold ${
                          isDenied
                            ? "bg-error-container/60 text-error border-error/30"
                            : "bg-success-container/60 text-success border-success/30"
                        }`}
                      >
                        {entry.outcome}
                      </Badge>
                    </TableCell>

                    {/* Action Button */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingEntry(entry);
                        }}
                        className="size-7 p-0 text-muted-foreground group-hover:text-primary"
                        title="View mutation details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-label-xs text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredLogs.length)} of{" "}
              {filteredLogs.length} entries
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="size-7 p-0"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="size-7 p-0"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspect Detail Modal — mounted on demand, so its chunk is fetched
          only once someone actually inspects a log entry. */}
      {inspectingEntry ? (
        <AuditDetailDialog
          open
          onOpenChange={(open) => !open && setInspectingEntry(null)}
          entry={inspectingEntry}
        />
      ) : null}
    </div>
  );
}
