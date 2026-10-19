"use client";

import { useState, useMemo } from "react";
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
} from "@/components/ui/table";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import { PROJECT_NAMES } from "@/types/project";
import { AuditDetailDialog } from "./audit-detail-dialog";
import type { AuditLogEntry } from "@/types/audit";

interface AuditTableProps {
  initialLogs: AuditLogEntry[];
}

export function AuditTable({ initialLogs }: AuditTableProps) {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("ALL");
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [inspectingEntry, setInspectingEntry] = useState<AuditLogEntry | null>(null);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    let list = [...initialLogs];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.actorName && l.actorName.toLowerCase().includes(q)) ||
          (l.actorRoll && l.actorRoll.toLowerCase().includes(q)) ||
          (l.targetRoll && l.targetRoll.toLowerCase().includes(q)) ||
          (l.targetName && l.targetName.toLowerCase().includes(q)) ||
          (l.summary && l.summary.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          (l.entityLabel && l.entityLabel.toLowerCase().includes(q))
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
          l.reason?.toLowerCase().includes("emergency")
      );
    }

    // Default sort: latest timestamp first
    list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return list;
  }, [initialLogs, search, selectedAction, selectedEntity, selectedProject, selectedOutcome, onlyEmergency]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                : "text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            }`}
          >
            <ShieldAlert className="size-3.5" />
            <span>Emergency Actions Only</span>
          </Button>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="p-0 bg-card border-border shadow-xs overflow-hidden">
        <Table>
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
                    onClick={() => setInspectingEntry(entry)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
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
                          {entry.actorRoll && <span className="font-mono">{entry.actorRoll}</span>}
                          {entry.effectiveRole && (
                            <Badge variant="outline" className="px-1 py-0 h-4 text-[9px] uppercase">
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
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 font-semibold"
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
                          {entry.entityType}: {entry.entityLabel || entry.entityId}
                        </span>
                      </div>
                    </TableCell>

                    {/* Summary / Reason */}
                    <TableCell className="max-w-xs">
                      <div className="space-y-0.5">
                        <p className="text-body-sm text-foreground line-clamp-1">{entry.summary}</p>
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
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300"
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
              {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
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

      {/* Inspect Detail Modal */}
      <AuditDetailDialog
        open={inspectingEntry !== null}
        onOpenChange={(open) => !open && setInspectingEntry(null)}
        entry={inspectingEntry}
      />
    </div>
  );
}
