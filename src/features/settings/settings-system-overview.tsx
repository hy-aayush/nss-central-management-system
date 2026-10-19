"use client";

import { Database, Server, Shield, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SettingsSystemOverview() {
  return (
    <div className="space-y-4">
      {/* Top Banner Notice */}
      <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-label-xs text-muted-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-primary shrink-0" />
          <span>
            Infrastructure Environment: <span className="font-semibold text-foreground">Supabase Free Tier (Postgres 15 + Auth)</span> • Region: <span className="font-mono text-foreground">ap-south-1 (Mumbai)</span>
          </span>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-semibold text-[10px]">
          Operational (Simulated)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Postgres DB Storage Quota */}
        <Card className="p-4 bg-card border-border shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Database Quota (Free Tier)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-headline-md font-bold font-mono text-foreground">
                  42.8 MB
                </span>
                <span className="text-label-xs text-muted-foreground">/ 500 MB</span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Database className="size-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "8.5%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground block text-right font-mono">
              8.5% allocated (Safe)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            SRS §2.1 hard ceiling. Strict column budgeting and zero BLOB storage in database.
          </p>
        </Card>

        {/* Unlogged Tables for FCFS */}
        <Card className="p-4 bg-card border-border shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                High-Concurrency FCFS Table
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-headline-md font-bold font-mono text-foreground">
                  Active
                </span>
                <span className="text-label-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  WAL Bypassed
                </span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="size-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground block text-right">
              Zero Write-Ahead-Log overhead
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <code>event_fcfs_temp</code> is an UNLOGGED table preventing disk write exhaustion during rapid rush.
          </p>
        </Card>

        {/* Auth User Allocation */}
        <Card className="p-4 bg-card border-border shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Auth Staff User Allocation
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-headline-md font-bold font-mono text-foreground">
                  24
                </span>
                <span className="text-label-xs text-muted-foreground">/ 50,000 MAU</span>
              </div>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="size-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "0.05%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground block text-right font-mono">
              Staff only (&lt; 0.1% MAU limit)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            General volunteers never create auth accounts. Only internal office staff authenticate.
          </p>
        </Card>
      </div>
    </div>
  );
}
