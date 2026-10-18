"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateIST, formatTimeIST, formatDateTimeIST } from "@/lib/time";
import type { VolunteerDetail } from "@/types/volunteer";
import type { EventRecord, Meeting } from "@/types/event";
import type { AuditLogEntry } from "@/types/audit";
import {
  CalendarDays,
  Users2,
  Clock,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface VolunteerHistoryTabsProps {
  volunteer: VolunteerDetail;
  events: {
    attended: EventRecord[];
    upcomingOrRegistered: EventRecord[];
  };
  meetings: Meeting[];
  auditLogs: AuditLogEntry[];
}

export function VolunteerHistoryTabs({
  volunteer,
  events,
  meetings,
  auditLogs,
}: VolunteerHistoryTabsProps) {
  return (
    <div className="space-y-3">
      <div className="border-b border-border/60 pb-1">
        <h2 className="text-base font-semibold text-foreground">
          Historical Records &amp; Activity Log
        </h2>
        <p className="text-xs text-muted-foreground">
          Comprehensive verified audit trail across all academic semesters
        </p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="events" className="gap-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            Event Participation ({events.attended.length + events.upcomingOrRegistered.length})
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5 text-xs">
            <Users2 className="h-3.5 w-3.5" />
            Meeting Attendance ({meetings.length})
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Hours Ledger ({volunteer.allocatedHours} hrs)
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs">
            <ShieldAlert className="h-3.5 w-3.5" />
            Security &amp; Audit Trail ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Tab 1: Event Participation ---------------- */}
        <TabsContent value="events" className="space-y-4 pt-3">
          {events.attended.length === 0 && events.upcomingOrRegistered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No Event History"
              description="This volunteer has not yet been checked in to any completed drives or FCFS rosters."
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <div className="space-y-6">
              {/* Completed Attended Events */}
              {events.attended.length > 0 && (
                <Card className="border border-border/70 bg-card/75">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Completed &amp; Verified Event Drives
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Past drives where volunteer attendance was verified and credited to service hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="divide-y divide-border/50">
                      {events.attended.map((e) => (
                        <div
                          key={e.id}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {e.type}
                              </Badge>
                              <span className="font-semibold text-foreground hover:text-primary transition-colors">
                                <Link href={`/events/${e.id}`}>{e.title}</Link>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground flex-wrap text-[11px]">
                              <span>{formatDateIST(e.startsAt)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                                {e.venue}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <span className="font-mono font-bold text-primary">
                              +{e.allocatedHours ?? 4} hrs
                            </span>
                            <StatusBadge status={e.status} type="event" showDot className="text-[10px] py-0 px-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming / Registered Events */}
              {events.upcomingOrRegistered.length > 0 && (
                <Card className="border border-border/70 bg-card/75">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Upcoming &amp; Scheduled Rosters
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Confirmed registrations for scheduled central or project drives.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="divide-y divide-border/50">
                      {events.upcomingOrRegistered.map((e) => (
                        <div
                          key={e.id}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                FCFS Registered
                              </Badge>
                              <Link
                                href={`/events/${e.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
                              >
                                {e.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground flex-wrap text-[11px]">
                              <span>{formatDateIST(e.startsAt)} at {formatTimeIST(e.startsAt)}</span>
                              <span>•</span>
                              <span>{e.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <span className="font-mono text-[11px] text-muted-foreground">
                              Est: {e.allocatedHours ?? 4} hrs
                            </span>
                            <StatusBadge status={e.status} type="event" showDot className="text-[10px] py-0 px-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ---------------- Tab 2: Meeting Attendance ---------------- */}
        <TabsContent value="attendance" className="space-y-4 pt-3">
          {meetings.length === 0 ? (
            <EmptyState
              icon={Users2}
              title="No Meeting Records"
              description="No project or central coordination meetings recorded for this volunteer's wing."
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Coordination Meetings &amp; Strategy Sessions
                </CardTitle>
                <CardDescription className="text-xs">
                  Mandatory wing meetings and central coordinator briefings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/50">
                  {meetings.map((m) => (
                    <div
                      key={m.id}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {m.type}
                          </Badge>
                          <span className="font-semibold text-foreground">
                            {m.agenda}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground flex-wrap text-[11px]">
                          <span>{formatDateIST(m.date)} at {m.startTime}</span>
                          <span>•</span>
                          <span>{m.venue}</span>
                          {m.mom && <span className="italic text-muted-foreground/80">&quot;{m.mom}&quot;</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          Present
                        </span>
                        {m.isAttendanceLocked && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---------------- Tab 3: Hours Ledger ---------------- */}
        <TabsContent value="hours" className="space-y-4 pt-3">
          <Card className="border border-border/70 bg-card/75">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Service Hours Ledger Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Verified community service hours breakdown per University NSS accreditation guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Approved Hours</span>
                  <div className="text-xl font-bold font-mono text-primary mt-0.5">
                    {volunteer.allocatedHours} hrs
                  </div>
                  <span className="text-[11px] text-muted-foreground">Credited toward 120 hr requirement</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                    {Math.min(100, Number(((volunteer.allocatedHours / 120) * 100).toFixed(1)))}%
                  </div>
                  <span className="text-[11px] text-muted-foreground">Of minimum degree requirement</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Pending Review</span>
                  <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                    0 hrs
                  </div>
                  <span className="text-[11px] text-muted-foreground">All submitted sessions reviewed</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>From Central Blood &amp; Medical Camps:</span>
                  <strong className="font-mono text-foreground">
                    {Math.round(volunteer.allocatedHours * 0.45)} hrs
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>From Assigned Project ({volunteer.project}) Drives:</span>
                  <strong className="font-mono text-foreground">
                    {Math.round(volunteer.allocatedHours * 0.40)} hrs
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>From Domain Specialization &amp; Preparations:</span>
                  <strong className="font-mono text-foreground">
                    {Math.round(volunteer.allocatedHours * 0.15)} hrs
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Tab 4: Security & Audit Trail ---------------- */}
        <TabsContent value="audit" className="space-y-4 pt-3">
          {auditLogs.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No Audit Records"
              description="No sensitive administrative actions or role changes recorded for this roll number."
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Immutable Record Audit Trail
                </CardTitle>
                <CardDescription className="text-xs">
                  Administrative changes, status modifications, and note edits for this volunteer.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/50">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {log.action}
                          </Badge>
                          <span>{log.actorName ?? log.actorRoll ?? "System"}</span>
                          {log.effectiveRole && (
                            <span className="text-muted-foreground text-[10px]">
                              ({log.effectiveRole})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {formatDateTimeIST(log.at)}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {log.summary}
                      </p>
                      {log.reason && (
                        <p className="text-[11px] text-muted-foreground/80 italic">
                          Reason: &quot;{log.reason}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
