import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, XCircle, Clock, Lock, Unlock } from "lucide-react";

interface AttendanceStatsBarProps {
  total: number;
  present: number;
  absent: number;
  excused: number;
  isLocked: boolean;
}

export function AttendanceStatsBar({
  total,
  present,
  absent,
  excused,
  isLocked,
}: AttendanceStatsBarProps) {
  const turnoutPercent = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Roster
            </p>
            <p className="text-headline-md font-semibold text-foreground tracking-tight">{total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">
              Present
            </p>
            <p className="text-headline-md font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {present}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">
              Absent
            </p>
            <p className="text-headline-md font-semibold text-rose-600 dark:text-rose-400 tracking-tight">
              {absent}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-4.5" />
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">
              Excused
            </p>
            <p className="text-headline-md font-semibold text-amber-600 dark:text-amber-400 tracking-tight">
              {excused}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border col-span-2 md:col-span-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-label-xs uppercase tracking-wider text-muted-foreground font-medium">
              Turnout Rate
            </p>
            <p className="text-headline-md font-bold text-primary tracking-tight">
              {turnoutPercent}%
            </p>
          </div>
          <div>
            {isLocked ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 text-[10px]">
                <Lock className="size-2.5 mr-1" />
                Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px]">
                <Unlock className="size-2.5 mr-1" />
                Open
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
