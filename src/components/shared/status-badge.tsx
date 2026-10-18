import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/auth";
import type { AttendanceStatus, EventStatus } from "@/types/event";
import type { VolunteerStatus } from "@/types/volunteer";
import type { AuditOutcome } from "@/types/audit";
import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert } from "lucide-react";

export type AnyStatus =
  | VolunteerStatus
  | EventStatus
  | AttendanceStatus
  | UserStatus
  | AuditOutcome
  | string;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: AnyStatus;
  type?: "volunteer" | "event" | "attendance" | "user" | "audit";
  showDot?: boolean;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  type = "volunteer",
  showDot = false,
  showIcon = false,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  let label = status;
  let colorClass = "bg-muted text-muted-foreground border-border";
  let dotClass = "bg-muted-foreground";
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;

  switch (normalized) {
    // Active / Completed / Present / Success
    case "ACTIVE":
      label = "Active";
      colorClass = "bg-success/15 text-success border-success/30";
      dotClass = "bg-success";
      IconComponent = CheckCircle2;
      break;

    case "COMPLETED":
      label = "Completed";
      colorClass = "bg-success/15 text-success border-success/30";
      dotClass = "bg-success";
      IconComponent = CheckCircle2;
      break;

    case "PRESENT":
      label = "Present";
      colorClass = "bg-success/15 text-success border-success/30";
      dotClass = "bg-success";
      IconComponent = CheckCircle2;
      break;

    case "SUCCESS":
      label = "Success";
      colorClass = "bg-success/15 text-success border-success/30";
      dotClass = "bg-success";
      IconComponent = CheckCircle2;
      break;

    // Scheduled / Published / Info
    case "SCHEDULED":
      label = "Scheduled";
      colorClass = "bg-info/15 text-info border-info/30";
      dotClass = "bg-info";
      IconComponent = Clock;
      break;

    case "PUBLISHED":
      label = "Published";
      colorClass = "bg-primary/15 text-primary border-primary/30";
      dotClass = "bg-primary";
      IconComponent = CheckCircle2;
      break;

    // Warning / Excused
    case "EXCUSED":
      label = "Excused";
      colorClass = "bg-warning/15 text-warning border-warning/30";
      dotClass = "bg-warning";
      IconComponent = AlertCircle;
      break;

    // Destructive / Suspended / Absent / Cancelled / Failure / Denied
    case "SUSPENDED":
      label = "Suspended";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = ShieldAlert;
      break;

    case "ABSENT":
      label = "Absent";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = XCircle;
      break;

    case "CANCELLED":
      label = "Cancelled";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = XCircle;
      break;

    case "FAILURE":
      label = "Failed";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = XCircle;
      break;

    case "DENIED":
      label = "Denied";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = ShieldAlert;
      break;

    case "REVOKED":
      label = "Revoked";
      colorClass = "bg-destructive/15 text-destructive border-destructive/30";
      dotClass = "bg-destructive";
      IconComponent = XCircle;
      break;

    // Muted / Draft / Archived
    case "DRAFT":
      label = "Draft";
      colorClass = "bg-muted text-muted-foreground border-border";
      dotClass = "bg-muted-foreground";
      IconComponent = Clock;
      break;

    case "ARCHIVED":
      label = "Archived";
      colorClass = "bg-muted text-muted-foreground border-border";
      dotClass = "bg-muted-foreground";
      break;

    default:
      label = status;
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full transition-colors",
        colorClass,
        className
      )}
      aria-label={props["aria-label"] || `${type} status: ${label}`}
      {...props}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)}
          aria-hidden="true"
        />
      )}
      {showIcon && IconComponent && (
        <IconComponent className="h-3 w-3 shrink-0" />
      )}
      <span>{label}</span>
    </Badge>
  );
}
