"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { AttendanceCorrectionDialog } from "./attendance-correction-dialog";
import { AttendanceStatsBar } from "./attendance-stats-bar";
import { AttendanceHistoryPanel } from "./attendance-history-panel";
import type { AttendanceCorrection, AttendanceStatus, EventParticipant, EventRecord } from "@/types/event";
import type { AttendanceCorrectionFormValues } from "./attendance-schemas";

interface AttendanceRosterTableProps {
  event: EventRecord;
  initialParticipants: EventParticipant[];
  initialCorrections: AttendanceCorrection[];
}

export function AttendanceRosterTable({
  event,
  initialParticipants,
  initialCorrections,
}: AttendanceRosterTableProps) {
  // Local mutable state for interactive simulation
  const [participants, setParticipants] = useState<EventParticipant[]>(initialParticipants);
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>(initialCorrections);
  const [isLocked, setIsLocked] = useState(event.isAttendanceLocked);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "ALL">("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Dialog states
  const [correctionParticipant, setCorrectionParticipant] = useState<EventParticipant | null>(null);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [bulkAbsentDialogOpen, setBulkAbsentDialogOpen] = useState(false);
  const [bulkPresentDialogOpen, setBulkPresentDialogOpen] = useState(false);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    let list = [...participants];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.volunteer.name.toLowerCase().includes(q) ||
          p.volunteer.rollNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (sourceFilter !== "ALL") {
      list = list.filter((p) => p.source === sourceFilter);
    }
    return list;
  }, [participants, search, statusFilter, sourceFilter]);

  // Derived counts for StatsBar
  const presentCount = participants.filter((p) => p.status === "PRESENT").length;
  const absentCount = participants.filter((p) => p.status === "ABSENT").length;
  const excusedCount = participants.filter((p) => p.status === "EXCUSED").length;

  // Status marking handler
  const handleMarkStatus = (participant: EventParticipant, newStatus: AttendanceStatus) => {
    if (participant.status === newStatus) return;

    if (isLocked) {
      // Locked: route through correction dialog
      setCorrectionParticipant(participant);
      setCorrectionDialogOpen(true);
      return;
    }

    // Direct marking (simulated)
    setParticipants((prev) =>
      prev.map((p) =>
        p.volunteer.rollNumber === participant.volunteer.rollNumber
          ? {
              ...p,
              status: newStatus,
              markedBy: "2105404",
              markedAt: new Date().toISOString(),
            }
          : p
      )
    );

    toast.success(`Marked ${participant.volunteer.name} as ${newStatus}`, {
      description: `Roll ${participant.volunteer.rollNumber} updated (Simulated).`,
    });
  };

  // Correction confirmation handler
  const handleConfirmCorrection = (values: AttendanceCorrectionFormValues) => {
    // 1. Update participant status
    setParticipants((prev) =>
      prev.map((p) =>
        p.volunteer.rollNumber === values.rollNumber
          ? {
              ...p,
              status: values.newStatus,
              markedBy: "2105404",
              markedAt: new Date().toISOString(),
            }
          : p
      )
    );

    // 2. Add correction record
    const newRecord: AttendanceCorrection = {
      id: Date.now(),
      attendanceFor: "EVENT",
      entityId: event.id,
      rollNumber: values.rollNumber,
      oldStatus: values.oldStatus,
      newStatus: values.newStatus,
      reason: values.reason,
      correctedBy: "2105404",
      correctedAt: new Date().toISOString(),
    };

    setCorrections((prev) => [newRecord, ...prev]);

    toast.success(`Audited Correction Applied`, {
      description: `Roll ${values.rollNumber} amended from ${values.oldStatus} to ${values.newStatus} with audit justification.`,
    });
  };

  // Bulk actions
  const handleBulkMarkPresent = () => {
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        status: "PRESENT" as AttendanceStatus,
        markedBy: "2105404",
        markedAt: new Date().toISOString(),
      }))
    );
    toast.success("Bulk Operation Complete", {
      description: "Marked all roster participants as PRESENT (Simulated).",
    });
  };

  const handleBulkMarkRemainingAbsent = () => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.status === "PRESENT"
          ? p
          : {
              ...p,
              status: "ABSENT" as AttendanceStatus,
              markedBy: "2105404",
              markedAt: new Date().toISOString(),
            }
      )
    );
    toast.info("Bulk Operation Complete", {
      description: "Marked all remaining volunteers as ABSENT (Simulated).",
    });
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Real-time stats bar */}
      <AttendanceStatsBar
        total={participants.length}
        present={presentCount}
        absent={absentCount}
        excused={excusedCount}
        isLocked={isLocked}
      />

      {/* Roster Container Card */}
      <Card className="p-6 bg-card border-border shadow-xs space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search participant by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border h-9.5 text-body-sm"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AttendanceStatus | "ALL")}>
              <SelectTrigger className="w-[130px] h-9.5 bg-background border-border text-label-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="EXCUSED">Excused</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sourceFilter}
              onValueChange={(val) => {
                if (val) setSourceFilter(val);
              }}
            >
              <SelectTrigger className="w-[130px] h-9.5 bg-background border-border text-label-sm">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sources</SelectItem>
                <SelectItem value="FCFS">FCFS List</SelectItem>
                <SelectItem value="AUTO">Host Auto</SelectItem>
                <SelectItem value="WALK_IN">Walk-in</SelectItem>
              </SelectContent>
            </Select>

            {/* Print Sheet Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSheet}
              className="h-9.5 px-3 text-label-xs text-muted-foreground hover:text-foreground"
            >
              <Printer className="size-3.5 mr-1.5" />
              Print Roll Call
            </Button>

            {/* Bulk actions */}
            {!isLocked && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkPresentDialogOpen(true)}
                  className="h-9.5 px-2.5 text-label-xs text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/10"
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAbsentDialogOpen(true)}
                  className="h-9.5 px-2.5 text-label-xs text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-500/10"
                >
                  Mark Rest Absent
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Locked warning banner */}
        {isLocked && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/40 text-label-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 shrink-0" />
              <span>
                <strong>Attendance is Locked:</strong> Roll call marking has closed. Clicking any status opens an audited correction dialog requiring a valid reason (SRS §11.7).
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLocked(false);
                toast.info("Attendance Unlocked (Coordinator Override)", {
                  description: "Attendance marking re-enabled for session staff.",
                });
              }}
              className="h-7 text-[11px] shrink-0 border-amber-400 text-amber-800 dark:text-amber-300"
            >
              Unlock Register
            </Button>
          </div>
        )}

        {/* Table View */}
        <div className="rounded-xl border border-border overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead className="w-[32%]">Student Name &amp; Roll</TableHead>
                <TableHead className="w-[18%]">Wing Affiliation</TableHead>
                <TableHead className="w-[15%]">Enrolment Source</TableHead>
                <TableHead className="w-[15%] text-center">Status</TableHead>
                <TableHead className="w-[20%] text-right">Quick Roll Call</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No participants found matching the query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((p, idx) => {
                  return (
                    <TableRow key={p.volunteer.rollNumber} className="hover:bg-muted/20">
                      <TableCell className="text-center font-mono text-label-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <Link
                            href={`/volunteers/${p.volunteer.rollNumber}`}
                            className="font-medium text-foreground hover:text-primary transition-colors text-body-sm block"
                          >
                            {p.volunteer.name}
                          </Link>
                          <span className="font-mono text-label-xs text-muted-foreground">
                            {p.volunteer.rollNumber}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-body-sm text-foreground">
                        {p.volunteer.project || "General"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${
                            p.source === "FCFS"
                              ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200"
                              : p.source === "AUTO"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200"
                          }`}
                        >
                          {p.source === "FCFS" ? "FCFS Roster" : p.source === "AUTO" ? "Host Auto" : "Walk-in"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {p.status === "PRESENT" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[11px]">
                            <CheckCircle2 className="size-3 mr-1" />
                            Present
                          </Badge>
                        ) : p.status === "EXCUSED" ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[11px]">
                            <Clock className="size-3 mr-1" />
                            Excused
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 text-[11px]">
                            <XCircle className="size-3 mr-1" />
                            Absent
                          </Badge>
                        )}
                      </TableCell>

                      {/* Quick action buttons P / A / E */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant={p.status === "PRESENT" ? "default" : "outline"}
                            onClick={() => handleMarkStatus(p, "PRESENT")}
                            className={`h-7 px-2.5 text-[11px] font-semibold transition-all ${
                              p.status === "PRESENT"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "hover:border-emerald-400 hover:text-emerald-600 text-muted-foreground"
                            }`}
                            title="Mark Present"
                          >
                            P
                          </Button>

                          <Button
                            size="sm"
                            variant={p.status === "ABSENT" ? "default" : "outline"}
                            onClick={() => handleMarkStatus(p, "ABSENT")}
                            className={`h-7 px-2.5 text-[11px] font-semibold transition-all ${
                              p.status === "ABSENT"
                                ? "bg-rose-600 hover:bg-rose-700 text-white"
                                : "hover:border-rose-400 hover:text-rose-600 text-muted-foreground"
                            }`}
                            title="Mark Absent"
                          >
                            A
                          </Button>

                          <Button
                            size="sm"
                            variant={p.status === "EXCUSED" ? "default" : "outline"}
                            onClick={() => handleMarkStatus(p, "EXCUSED")}
                            className={`h-7 px-2.5 text-[11px] font-semibold transition-all ${
                              p.status === "EXCUSED"
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "hover:border-amber-400 hover:text-amber-600 text-muted-foreground"
                            }`}
                            title="Mark Excused"
                          >
                            E
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Historical Corrections Panel */}
      <AttendanceHistoryPanel corrections={corrections} />

      {/* Attendance Correction Dialog */}
      <AttendanceCorrectionDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        participant={correctionParticipant}
        onConfirmCorrection={handleConfirmCorrection}
      />

      {/* Confirm Dialog: Bulk All Present */}
      <ConfirmDialog
        open={bulkPresentDialogOpen}
        onOpenChange={setBulkPresentDialogOpen}
        title="Mark All Participants Present?"
        description="This will set all enrolled participants to PRESENT. This action is simulated on the client."
        confirmLabel="Mark All Present"
        variant="default"
        onConfirm={handleBulkMarkPresent}
      />

      {/* Confirm Dialog: Bulk Rest Absent */}
      <ConfirmDialog
        open={bulkAbsentDialogOpen}
        onOpenChange={setBulkAbsentDialogOpen}
        title="Mark Remaining Unmarked as Absent?"
        description="This will set all participants who are not currently marked PRESENT to ABSENT (SRS §11.7)."
        confirmLabel="Mark Rest Absent"
        variant="default"
        onConfirm={handleBulkMarkRemainingAbsent}
      />
    </div>
  );
}
