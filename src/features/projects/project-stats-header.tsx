import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, Users, Clock, CalendarCheck } from "lucide-react";

interface ProjectStatsHeaderProps {
  projectCount: number;
  totalVolunteers: number;
  totalHours: number;
  totalEvents: number;
}

export function ProjectStatsHeader({
  projectCount,
  totalVolunteers,
  totalHours,
  totalEvents,
}: ProjectStatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Active Wings</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{projectCount}</span>
              <span className="text-[11px] text-muted-foreground">SDG Projects</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Deployed Volunteers</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{totalVolunteers}</span>
              <span className="text-[11px] text-muted-foreground">in field</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Service Hours</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{totalHours.toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-muted-foreground">logged</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Community Drives</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{totalEvents}</span>
              <span className="text-[11px] text-muted-foreground">completed &amp; scheduled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
