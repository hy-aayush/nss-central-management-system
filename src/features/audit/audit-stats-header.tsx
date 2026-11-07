"use client";

import { ShieldAlert, AlertTriangle, Users, History } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import type { AuditLogEntry } from "@/types/audit";

interface AuditStatsHeaderProps {
  logs: AuditLogEntry[];
}

export function AuditStatsHeader({ logs }: AuditStatsHeaderProps) {
  const total = logs.length;
  const emergencyCount = logs.filter(
    (l) =>
      l.action === "EMERGENCY_ACCESS_GRANT" ||
      l.action === "EMERGENCY_ACCESS_REVOKE" ||
      l.reason?.toLowerCase().includes("emergency"),
  ).length;
  const deniedCount = logs.filter((l) => l.outcome === "DENIED").length;
  const uniqueActors = new Set(logs.map((l) => l.actorRoll).filter(Boolean))
    .size;

  return (
    <MetricStrip
      columns={4}
      items={[
        {
          label: "Audit records",
          value: total,
          hint: "Permanent retention · SRS §13",
          icon: History,
          tone: "primary",
        },
        {
          label: "Emergency actions",
          value: emergencyCount,
          hint: "Time-boxed packs, max 24 hours",
          icon: ShieldAlert,
          tone: "warning",
        },
        {
          label: "Security blocks",
          value: deniedCount,
          hint: "Unauthorised attempts intercepted",
          icon: AlertTriangle,
          tone: "danger",
        },
        {
          label: "Operating officers",
          value: uniqueActors,
          hint: "Active in this period",
          icon: Users,
        },
      ]}
    />
  );
}
