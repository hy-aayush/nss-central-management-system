import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Award, Palette } from "lucide-react";

interface VolunteerStatsBarProps {
  total: number;
  active: number;
  year2Count: number;
  year3Count: number;
  year4Count: number;
  domainCount: number;
  avgAttendance: number;
}

export function VolunteerStatsBar({
  total,
  active,
  year2Count,
  year3Count,
  year4Count,
  domainCount,
  avgAttendance,
}: VolunteerStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Active Volunteers</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{active}</span>
              <span className="text-[11px] text-muted-foreground font-mono">/ {total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Year Distribution</p>
            <div className="flex items-baseline gap-1 text-xs font-mono font-medium text-foreground">
              <span>{year2Count}</span>
              <span className="text-muted-foreground text-[10px]">2nd</span>
              <span className="text-muted-foreground">•</span>
              <span>{year3Count}</span>
              <span className="text-muted-foreground text-[10px]">3rd</span>
              <span className="text-muted-foreground">•</span>
              <span>{year4Count}</span>
              <span className="text-muted-foreground text-[10px]">4th</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Palette className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Domain Specialists</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{domainCount}</span>
              <span className="text-[11px] text-muted-foreground">in 4 wings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Avg Turnout Rate</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{avgAttendance}%</span>
              <span className="text-[11px] text-muted-foreground">across drives</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
