"use client";

import { Shield, Wrench, Building2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RosterEntry } from "@/types/auth";

interface TeamStatsHeaderProps {
  entries: RosterEntry[];
}

export function TeamStatsHeader({ entries }: TeamStatsHeaderProps) {
  const coordinators = entries.filter((e) => e.role === "COORDINATOR").length;
  const techTeam = entries.filter((e) => e.role === "TECH_TEAM").length;
  const prs = entries.filter((e) => e.role === "PROJECT_REPRESENTATIVE").length;
  const builders = entries.filter((e) => e.role === "BUILDER").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tier 5: Student Coordinators */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Coordinators (Tier 5)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {coordinators}
              </span>
              <span className="text-label-xs text-muted-foreground">
                Governance Officers
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Approvals, overrides &amp; 2-man actions
        </p>
      </Card>

      {/* Tier 4 & 3: Tech Team */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-emerald-500/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tech Team (Tiers 4 &amp; 3)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {techTeam}
              </span>
              <span className="text-label-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Mentors &amp; Members
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wrench className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          CMS administration &amp; technical logs
        </p>
      </Card>

      {/* Tier 2: Project Representatives */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Project PRs (Tier 2)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {prs}
              </span>
              <span className="text-label-xs text-muted-foreground">
                2 PRs per Wing (18 total)
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Scoped authority over project volunteers
        </p>
      </Card>

      {/* Tier 1: Builders & POCs */}
      <Card className="p-4 bg-card border-border shadow-xs hover:border-amber-500/40 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-label-xs font-medium uppercase tracking-wider text-muted-foreground">
              Builders &amp; POCs (Tier 1-2)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm font-bold text-foreground font-mono">
                {builders}
              </span>
              <span className="text-label-xs text-muted-foreground">
                Domain &amp; Drive Leads
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="size-4" />
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-border/50 text-label-xs text-muted-foreground">
          Zero personal data access (Rule 5)
        </p>
      </Card>
    </div>
  );
}
