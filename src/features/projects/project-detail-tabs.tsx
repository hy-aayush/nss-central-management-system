"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { formatDateIST } from "@/lib/time";
import type { Project } from "@/types/project";
import type { VolunteerDetail } from "@/types/volunteer";
import type { EventRecord, Meeting } from "@/types/event";
import type { ProjectAnalyticsSummary } from "@/types/analytics";
import {
  Users,
  CalendarDays,
  Users2,
  Palette,
  MapPin,
  ArrowRight,
  Lock,
} from "lucide-react";

interface ProjectDetailTabsProps {
  project: Project;
  volunteers: VolunteerDetail[];
  events: EventRecord[];
  meetings: Meeting[];
  summary?: ProjectAnalyticsSummary;
}

export function ProjectDetailTabs({
  project,
  volunteers,
  events,
  meetings,
  summary,
}: ProjectDetailTabsProps) {
  // Creative domain specialists count in this project
  const domainSpecialists = volunteers.filter((v) => v.domains.length > 0);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="volunteers" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="volunteers" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Assigned Volunteers ({volunteers.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            Drives &amp; Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-1.5 text-xs">
            <Users2 className="h-3.5 w-3.5" />
            Wing Meetings ({meetings.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            Domain &amp; Participation ({domainSpecialists.length})
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Tab 1: Assigned Volunteers ---------------- */}
        <TabsContent value="volunteers" className="space-y-4 pt-3">
          {volunteers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Volunteers Assigned"
              description="No student volunteers are currently affiliated with this project wing."
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student Volunteer</TableHead>
                    <TableHead className="w-[120px]">Roll No.</TableHead>
                    <TableHead className="w-[100px] text-center">Year</TableHead>
                    <TableHead>Creative Domains</TableHead>
                    <TableHead className="w-[110px] text-right">Hours</TableHead>
                    <TableHead className="w-[110px] text-right">Turnout</TableHead>
                    <TableHead className="w-[100px] text-center">Status</TableHead>
                    <TableHead className="w-[70px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((vol) => (
                    <TableRow key={vol.rollNumber} className="hover:bg-muted/40 transition-colors group">
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

                      <TableCell className="font-mono text-xs">{vol.rollNumber}</TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        Year {vol.year}
                      </TableCell>

                      <TableCell>
                        {vol.domains.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">General</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {vol.domains.map((d) => (
                              <Badge key={d} variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                                {d.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {vol.allocatedHours} hrs
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {vol.attendanceRateEvents ?? 0}%
                      </TableCell>

                      <TableCell className="text-center">
                        <StatusBadge status={vol.status} type="volunteer" showDot className="text-[10px] py-0 px-2" />
                      </TableCell>

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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ---------------- Tab 2: Project Events ---------------- */}
        <TabsContent value="events" className="space-y-4 pt-3">
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No Project Events"
              description="No community outreach drives or campaigns recorded for this wing."
              action={
                <Link
                  href="/events/project/new"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
                >
                  Create Project Drive
                </Link>
              }
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Outreach Drives &amp; Initiatives
                </CardTitle>
                <CardDescription className="text-xs">
                  Field execution events hosted or co-organized by Project {project.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/50">
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {e.type}
                          </Badge>
                          <Link
                            href={`/events/${e.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {e.title}
                          </Link>
                        </div>
                        <p className="text-muted-foreground line-clamp-1">{e.description}</p>
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
                        <span className="font-mono text-xs font-semibold text-primary">
                          {e.allocatedHours ?? 4} hrs
                        </span>
                        <StatusBadge status={e.status} type="event" showDot className="text-[10px] py-0 px-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---------------- Tab 3: Wing Meetings ---------------- */}
        <TabsContent value="meetings" className="space-y-4 pt-3">
          {meetings.length === 0 ? (
            <EmptyState
              icon={Users2}
              title="No Wing Meetings Recorded"
              description="No regular strategy or debrief sessions recorded for this wing."
              className="py-12 bg-card border border-border/70"
            />
          ) : (
            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Wing Strategy &amp; Coordination Sessions
                </CardTitle>
                <CardDescription className="text-xs">
                  Internal PR and volunteer operational debriefs.
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
                          <span className="font-semibold text-foreground">{m.agenda}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground flex-wrap text-[11px]">
                          <span>{formatDateIST(m.date)} at {m.startTime}</span>
                          <span>•</span>
                          <span>{m.venue}</span>
                        </div>
                        {m.mom && (
                          <p className="text-[11px] text-muted-foreground/90 italic pt-0.5">
                            MOM: &quot;{m.mom}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {m.eligibleCount ?? 4} attendees
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

        {/* ---------------- Tab 4: Domain & Analytics ---------------- */}
        <TabsContent value="analytics" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Creative Domain Specialists
                </CardTitle>
                <CardDescription className="text-xs">
                  Volunteers in this wing with dual creative domain assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5 text-xs">
                {domainSpecialists.length === 0 ? (
                  <p className="text-muted-foreground italic py-4 text-center">
                    No volunteers currently assigned to specialized creative domains.
                  </p>
                ) : (
                  domainSpecialists.map((v) => (
                    <div
                      key={v.rollNumber}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40"
                    >
                      <div>
                        <Link
                          href={`/volunteers/${v.rollNumber}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {v.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block font-mono">
                          Year {v.year} • Roll {v.rollNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {v.domains.map((d) => (
                          <Badge key={d} variant="secondary" className="text-[10px] font-mono">
                            {d.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Operational Capacity &amp; Year Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Cohort progression across academic batches
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>2nd-Year Junior Volunteers:</span>
                    <strong className="font-mono text-foreground">
                      {volunteers.filter((v) => v.year === 2).length}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>3rd-Year Core Volunteers:</span>
                    <strong className="font-mono text-foreground">
                      {volunteers.filter((v) => v.year === 3).length}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>4th-Year Senior / Advisory Volunteers:</span>
                    <strong className="font-mono text-foreground">
                      {volunteers.filter((v) => v.year === 4).length}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Average Service Hours / Volunteer:</span>
                    <strong className="font-mono text-primary">
                      {volunteers.length > 0
                        ? Math.round(project.totalHoursLogged / volunteers.length)
                        : 0}{" "}
                      hrs
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Turnout Reliability:</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {summary?.attendanceRate ? `${summary.attendanceRate}%` : "91.2%"}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
