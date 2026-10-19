"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  Building2,
  Wrench,
  Sparkles,
  ExternalLink,
  Edit2,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDateIST } from "@/lib/time";
import type { RosterEntry } from "@/types/auth";

interface TeamRosterTableProps {
  entries: RosterEntry[];
  onEditRole: (entry: RosterEntry) => void;
  onUpdateStatus: (entryId: number, newStatus: "ACTIVE" | "SUSPENDED") => void;
}

export function TeamRosterTable({
  entries,
  onEditRole,
  onUpdateStatus,
}: TeamRosterTableProps) {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Confirm dialog state for suspension
  const [suspensionTarget, setSuspensionTarget] = useState<RosterEntry | null>(null);

  const filteredEntries = useMemo(() => {
    let list = [...entries];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.volunteer.name.toLowerCase().includes(q) ||
          e.rollNumber.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    if (selectedRole !== "ALL") {
      list = list.filter((e) => e.role === selectedRole);
    }

    if (selectedStatus !== "ALL") {
      list = list.filter((e) => (e.status || e.accessStatus) === selectedStatus);
    }

    return list;
  }, [entries, search, selectedRole, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRoleBadge = (entry: RosterEntry) => {
    switch (entry.role) {
      case "COORDINATOR":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold gap-1">
            <Shield className="size-3" />
            <span>Coordinator (T-5)</span>
          </Badge>
        );
      case "TECH_TEAM":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-semibold gap-1">
            <Wrench className="size-3" />
            <span>Tech {entry.techKind || "Team"} (T-{entry.techKind === "MENTOR" ? 4 : 3})</span>
          </Badge>
        );
      case "PROJECT_REPRESENTATIVE":
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 gap-1">
            <Building2 className="size-3" />
            <span>PR: {entry.projectScope?.[0] || entry.volunteer.project} (T-2)</span>
          </Badge>
        );
      case "BUILDER":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 gap-1">
            <Sparkles className="size-3" />
            <span>Builder: {entry.builderKind || "POC"} (T-1)</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="p-4 bg-card border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search staff name or roll number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-body-sm bg-background border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedRole}
              onValueChange={(val) => {
                if (val) {
                  setSelectedRole(val);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 w-44 bg-background border-border text-label-xs">
                <SelectValue placeholder="Role: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="COORDINATOR">Coordinators (Tier 5)</SelectItem>
                <SelectItem value="TECH_TEAM">Tech Team (Tiers 4-3)</SelectItem>
                <SelectItem value="PROJECT_REPRESENTATIVE">Project PRs (Tier 2)</SelectItem>
                <SelectItem value="BUILDER">Builders &amp; POCs (Tier 1-2)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                if (val) {
                  setSelectedStatus(val);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 w-36 bg-background border-border text-label-xs">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card className="p-0 bg-card border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/80">
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Officer &amp; Roll
                </span>
              </TableHead>
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Post Tier &amp; Assigned Scope
                </span>
              </TableHead>
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tenure Starts
                </span>
              </TableHead>
              <TableHead>
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Appointing Officer
                </span>
              </TableHead>
              <TableHead className="w-24 text-center">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
              </TableHead>
              <TableHead className="w-28 text-right">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="space-y-1">
                    <UserX className="size-6 text-muted-foreground/40 mx-auto" />
                    <p className="text-body-sm font-medium text-foreground">
                      No matching staff members found
                    </p>
                    <p className="text-label-xs text-muted-foreground">
                      Adjust your role filters or search query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((entry) => {
                const status = entry.status || entry.accessStatus;
                const isActive = status === "ACTIVE";

                return (
                  <TableRow key={entry.id} className="hover:bg-muted/40 transition-colors">
                    {/* Officer Identity */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-label-sm block">
                          {entry.volunteer.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-label-xs text-muted-foreground">
                          <span className="font-mono">{entry.rollNumber}</span>
                          <span>•</span>
                          <span>{entry.volunteer.project}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Scope */}
                    <TableCell>
                      <div className="space-y-1">
                        {getRoleBadge(entry)}
                        {entry.notes && (
                          <span className="text-[11px] text-muted-foreground block line-clamp-1">
                            {entry.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Tenure */}
                    <TableCell className="text-label-xs text-muted-foreground">
                      <span className="font-medium text-foreground block">
                        {formatDateIST(entry.startsAt)}
                      </span>
                      <span className="text-[10px]">Academic Year 2026</span>
                    </TableCell>

                    {/* Appointing Authority */}
                    <TableCell className="text-label-xs text-muted-foreground">
                      <span className="text-foreground block">{entry.approvedBy || "Student Coordinator"}</span>
                      {entry.grantedBy && (
                        <span className="text-[10px] font-mono">Roll: {entry.grantedBy}</span>
                      )}
                    </TableCell>

                    {/* Access Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0 h-4.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300"
                        }`}
                      >
                        {status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRole(entry)}
                          className="size-7 p-0 text-muted-foreground hover:text-primary"
                          title="Modify role / scope"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSuspensionTarget(entry)}
                          className={`size-7 p-0 ${
                            isActive
                              ? "text-muted-foreground hover:text-rose-600"
                              : "text-muted-foreground hover:text-emerald-600"
                          }`}
                          title={isActive ? "Suspend staff access" : "Reinstate access"}
                        >
                          <UserX className="size-3.5" />
                        </Button>

                        <Link
                          href={`/volunteers/${entry.rollNumber}`}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="View volunteer file"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-label-xs text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredEntries.length)} of {filteredEntries.length} officers
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

      {/* Sensitive Confirmation Dialog for Suspension */}
      <ConfirmDialog
        open={suspensionTarget !== null}
        onOpenChange={(open) => !open && setSuspensionTarget(null)}
        title={
          suspensionTarget?.status === "ACTIVE"
            ? `Suspend Office Access: ${suspensionTarget?.volunteer.name}`
            : `Reinstate Staff Access: ${suspensionTarget?.volunteer.name}`
        }
        description={
          suspensionTarget?.status === "ACTIVE"
            ? `Suspending ${suspensionTarget?.volunteer.name} (${suspensionTarget?.rollNumber}) will immediately revoke their ${suspensionTarget?.role} office permissions and block management access. This action will be recorded in the security audit ledger.`
            : `Reinstating ${suspensionTarget?.volunteer.name} (${suspensionTarget?.rollNumber}) will restore their operational permissions on the NSS portal.`
        }
        confirmLabel={suspensionTarget?.status === "ACTIVE" ? "Suspend Access" : "Reinstate Access"}
        variant={suspensionTarget?.status === "ACTIVE" ? "destructive" : "default"}
        onConfirm={() => {
          if (suspensionTarget) {
            const nextStatus = suspensionTarget.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
            onUpdateStatus(suspensionTarget.id, nextStatus);
            toast.success(
              nextStatus === "SUSPENDED" ? "Staff Access Suspended" : "Staff Access Reinstated",
              {
                description: `Updated status for ${suspensionTarget.volunteer.name} (${suspensionTarget.rollNumber}) to ${nextStatus}. Simulated client state.`,
              }
            );
            setSuspensionTarget(null);
          }
        }}
      />
    </div>
  );
}
