"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateIST } from "@/lib/time";
import type { EventRecord, EventParticipant, AttendanceStatus } from "@/types/event";

interface EventDetailTabsProps {
  event: EventRecord;
  participants: EventParticipant[];
}

export function EventDetailTabs({ event, participants }: EventDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("participants");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "ALL">("ALL");

  // Filtered participant list
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
    return list;
  }, [participants, search, statusFilter]);

  // Derived stats
  const totalEnrolled = participants.length;
  const presentCount = participants.filter((p) => p.status === "PRESENT").length;
  const absentCount = participants.filter((p) => p.status === "ABSENT").length;
  const excusedCount = participants.filter((p) => p.status === "EXCUSED").length;
  const turnoutPercent = totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 border border-border rounded-xl">
          <TabsTrigger value="participants" className="gap-1.5 text-label-sm">
            <Users className="size-4" />
            <span>Enrolled Roster ({participants.length})</span>
          </TabsTrigger>
          <TabsTrigger value="slots" className="gap-1.5 text-label-sm">
            <Building2 className="size-4" />
            <span>Project Wing Slots ({event.projects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5 text-label-sm">
            <BarChart3 className="size-4" />
            <span>Turnout Summary</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5 text-label-sm">
            <ShieldCheck className="size-4" />
            <span>Lifecycle &amp; Governance</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Participants Roster */}
        <TabsContent value="participants" className="space-y-4 pt-2">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search participant by name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border h-9 text-body-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AttendanceStatus | "ALL")}>
                <SelectTrigger className="w-[140px] h-9 bg-card border-border text-label-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>

              <Link
                href={`/attendance?eventId=${event.id}`}
                className={cn(buttonVariants({ size: "sm" }), "h-9 text-label-xs shadow-xs")}
              >
                <UserCheck className="size-3.5 mr-1.5" />
                Take Roll Call
              </Link>
            </div>
          </div>

          {/* Roster Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[35%]">Volunteer</TableHead>
                  <TableHead className="w-[20%]">Project Wing</TableHead>
                  <TableHead className="w-[15%]">Enrolment Source</TableHead>
                  <TableHead className="w-[15%]">Attendance</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No participants match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((p) => {
                    return (
                      <TableRow key={p.volunteer.rollNumber} className="hover:bg-muted/30">
                        <TableCell className="py-3">
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

                        <TableCell className="py-3 text-label-sm text-foreground">
                          {p.volunteer.project || "General"}
                        </TableCell>

                        <TableCell className="py-3">
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
                            {p.source === "FCFS" ? "FCFS Roster" : p.source === "AUTO" ? "Host Auto-Add" : "Walk-in"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3">
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

                        <TableCell className="py-3 text-right">
                          <Link
                            href={`/volunteers/${p.volunteer.rollNumber}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-7.5 px-2 text-label-xs text-primary"
                            )}
                          >
                            Profile
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Project Slots & Collaboration */}
        <TabsContent value="slots" className="space-y-4 pt-2">
          <Card className="p-6 bg-card border-border shadow-xs space-y-4">
            <div>
              <h3 className="text-headline-sm font-semibold text-foreground">
                Project Wing Quota Allocations
              </h3>
              <p className="text-body-sm text-muted-foreground mt-0.5">
                Per-project slot capacities and year-wise quotas configured for this event drive (SRS §11.3).
              </p>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Project Wing</TableHead>
                    <TableHead>Role / Wing Type</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="text-center">Total Slots</TableHead>
                    <TableHead className="text-center">2nd / 3rd / 4th Year Caps</TableHead>
                    <TableHead className="text-right">Filled Slots</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.projects.map((slot) => (
                    <TableRow key={slot.projectId}>
                      <TableCell className="font-semibold text-foreground">
                        {slot.projectName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={slot.isHost ? "default" : "outline"} className="text-[10px]">
                          {slot.isHost ? "Host Wing" : "Collaborating"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            slot.approval === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200"
                          }
                        >
                          {slot.approval}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {slot.slotsTotal ?? "Open"}
                      </TableCell>
                      <TableCell className="text-center text-label-xs text-muted-foreground">
                        {slot.capYear2 ?? "—"} / {slot.capYear3 ?? "—"} / {slot.capYear4 ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {slot.filled}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Turnout Summary */}
        <TabsContent value="attendance" className="space-y-4 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border">
              <p className="text-label-xs uppercase tracking-wider text-muted-foreground">Total Enrolled</p>
              <p className="text-headline-md font-bold text-foreground mt-1">{totalEnrolled}</p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <p className="text-label-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Present
              </p>
              <p className="text-headline-md font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {presentCount}
              </p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <p className="text-label-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">Absent</p>
              <p className="text-headline-md font-bold text-rose-600 dark:text-rose-400 mt-1">
                {absentCount}
              </p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <p className="text-label-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Excused</p>
              <p className="text-headline-md font-bold text-amber-600 dark:text-amber-400 mt-1">
                {excusedCount}
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-headline-sm font-semibold text-foreground">Turnout Percentage &amp; Demographics</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-muted/30">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-label-xs text-muted-foreground uppercase tracking-wider">
                  Verified Attendance Rate
                </span>
                <p className="text-3xl font-bold text-primary">{turnoutPercent}%</p>
                <p className="text-label-xs text-muted-foreground">Office bearers excluded from penalty counters</p>
              </div>

              {event.genderPresent && (
                <div className="flex items-center gap-4 text-label-sm">
                  <div className="text-center">
                    <span className="text-muted-foreground block text-label-xs">Male</span>
                    <span className="font-semibold text-foreground">{event.genderPresent.male}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground block text-label-xs">Female</span>
                    <span className="font-semibold text-foreground">{event.genderPresent.female}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground block text-label-xs">Other</span>
                    <span className="font-semibold text-foreground">{event.genderPresent.other}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Governance & Audit Trail */}
        <TabsContent value="governance" className="space-y-4 pt-2">
          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="text-headline-sm font-semibold text-foreground">Audit &amp; Lifecycle Records</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-label-xs uppercase tracking-wider text-muted-foreground block font-medium">
                  Created By
                </span>
                <span className="font-semibold text-foreground">
                  {event.createdBy?.name || "System Admin"} ({event.createdBy?.rollNumber || "2105999"})
                </span>
                <p className="text-label-xs text-muted-foreground">
                  Role: {event.createdByRole || "TECH_TEAM"} • Created on {formatDateIST(event.createdAt)}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-label-xs uppercase tracking-wider text-muted-foreground block font-medium">
                  Edit Budget Status (SRS §11.2)
                </span>
                <span className="font-semibold text-foreground">
                  {event.editsLeft !== null ? `${event.editsLeft} Edits Remaining` : "Exempt Viewer (Full Authority)"}
                </span>
                <p className="text-label-xs text-muted-foreground">
                  Reschedule Count: {event.rescheduleCount} • Finalized: {event.isFinalized ? "Yes" : "No"}
                </p>
              </div>

              {event.cancellationReason && (
                <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive md:col-span-2 space-y-1">
                  <span className="text-label-xs uppercase tracking-wider block font-semibold">
                    Cancellation Justification Reason
                  </span>
                  <p className="text-body-sm">{event.cancellationReason}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
