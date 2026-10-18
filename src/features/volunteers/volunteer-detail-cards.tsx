import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIST } from "@/lib/time";
import type { VolunteerDetail } from "@/types/volunteer";
import { FileText, CalendarCheck, AlertTriangle } from "lucide-react";

interface VolunteerDetailCardsProps {
  volunteer: VolunteerDetail;
}

export function VolunteerDetailCards({ volunteer }: VolunteerDetailCardsProps) {
  const stats = volunteer.stats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 4 Quick Stat Metric Tiles (lg:col-span-8) */}
      <div className="lg:col-span-8 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <CalendarCheck className="h-4 w-4 text-primary" />
          Active Service Records &amp; Attendance Standing
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-border/70 bg-card/75">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Approved Hours</span>
              <div className="text-2xl font-bold font-mono text-primary">
                {volunteer.allocatedHours}
              </div>
              <p className="text-[11px] text-muted-foreground">Logged to date</p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/75">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Events Turnout</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {volunteer.attendanceRateEvents ?? 0}%
              </div>
              <p className="text-[11px] text-muted-foreground">
                {volunteer.eventsAttendedCount} events attended
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/75">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Meeting Attendance</span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {volunteer.attendanceRateMeetings ?? 0}%
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.meetingsPresent} of {stats.meetingsPresent + stats.meetingsAbsent} sessions
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/75">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">FCFS Reliability</span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {stats.eventsFcfsPresent} / {stats.eventsFcfsFinal}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.eventsMissedFcfs > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {stats.eventsMissedFcfs} missed FCFS
                  </span>
                ) : (
                  "Zero missed slots"
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FCFS Missed slot warning banner if applicable */}
        {stats.eventsMissedFcfs >= 2 && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>FCFS Reliability Notice:</strong> Volunteer has missed {stats.eventsMissedFcfs} finalized FCFS event slots. Per Section 8.3, reaching 3 missed slots incurs an automated 30-day FCFS signup lockout.
            </span>
          </div>
        )}
      </div>

      {/* Confidential Coordinator Notes (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" />
          Confidential Coordinator Note
        </h2>

        <Card className="border border-border/70 bg-card/75 shadow-sm h-[calc(100%-28px)] flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-foreground">Internal Assessment</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                {volunteer.notesEditsLeft} edits remaining
              </Badge>
            </div>
            <CardDescription className="text-[11px]">
              Restricted to Coordinators and Tech Team
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 flex-1 flex flex-col justify-between pt-0 text-xs">
            <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50 leading-relaxed italic">
              &quot;{volunteer.notes || "No coordinator notes recorded yet."}&quot;
            </p>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground/80 flex items-center justify-between">
              <span>Updated by: <strong className="font-mono text-foreground">{volunteer.notesUpdatedBy ?? "System"}</strong></span>
              <span>{formatDateIST(volunteer.notesUpdatedAt ?? volunteer.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
