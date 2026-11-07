"use client";

import { Shield, Wrench, Building2, Sparkles } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import type { RosterEntry } from "@/types/auth";

interface TeamStatsHeaderProps {
  entries: RosterEntry[];
}

export function TeamStatsHeader({ entries }: TeamStatsHeaderProps) {
  const coordinators = entries.filter((e) => e.role === "COORDINATOR").length;
  const techTeam = entries.filter((e) => e.role === "TECH_TEAM").length;
  const prs = entries.filter(
    (e) => e.role === "PROJECT_REPRESENTATIVE",
  ).length;
  const builders = entries.filter((e) => e.role === "BUILDER").length;

  return (
    <MetricStrip
      columns={4}
      items={[
        {
          label: "Coordinators · Tier 5",
          value: coordinators,
          hint: "Approvals, overrides, two-man actions",
          icon: Shield,
          tone: "primary",
        },
        {
          label: "Tech team · Tiers 4 & 3",
          value: techTeam,
          hint: "CMS administration and technical logs",
          icon: Wrench,
        },
        {
          label: "Project PRs · Tier 2",
          value: prs,
          hint: "Scoped authority over project volunteers",
          icon: Building2,
        },
        {
          label: "Builders & POCs",
          value: builders,
          hint: "Domain and drive leads · no personal data",
          icon: Sparkles,
        },
      ]}
    />
  );
}
