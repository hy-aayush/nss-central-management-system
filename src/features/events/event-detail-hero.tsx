"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Globe2,
  Lock,
  UserCheck,
  AlertOctagon,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { EventRecord } from "@/types/event";

interface EventDetailHeroProps {
  event: EventRecord;
}

export function EventDetailHero({ event }: EventDetailHeroProps) {
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(event.isAttendanceLocked);
  const [status, setStatus] = useState(event.status);

  const isCentral = event.type === "CENTRAL";
  const primaryWing = event.projectName ?? (event.projects[0]?.projectName || "All Wings");

  const handleConfirmLock = () => {
    setIsLocked(true);
    toast.success("Attendance Locked Early (Simulated)", {
      description: "Attendance sheet locked ahead of midnight. Subsequent edits will require an audit correction reason (SRS §11.7).",
    });
  };

  const handleConfirmCancel = () => {
    setStatus("CANCELLED");
    toast.error("Event Cancelled (Simulated)", {
      description: "Event has been marked as cancelled with an immutable audit entry.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 px-2 text-muted-foreground hover:text-foreground")}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Back to Events Directory
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }
            }}
            className="h-8 text-label-xs"
          >
            <Share2 className="size-3.5 mr-1.5" />
            Share
          </Button>
          <Link
            href={`/attendance?eventId=${event.id}`}
            className={cn(buttonVariants({ size: "sm" }), "h-8 text-label-xs shadow-xs")}
          >
            <UserCheck className="size-3.5 mr-1.5" />
            Mark Attendance Register
          </Link>
        </div>
      </div>

      {/* Main Hero Card */}
      <Card className="p-6 bg-card border-border shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-label-xs font-semibold border ${
                  isCentral
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {isCentral ? <Globe2 className="size-3 mr-1 inline" /> : <Building2 className="size-3 mr-1 inline" />}
                {isCentral ? "Central Organization Event" : `${primaryWing} Wing Project Drive`}
              </Badge>

              <StatusBadge status={status} />

              {event.category && (
                <Badge variant="secondary" className="text-label-xs">
                  {event.category.name}
                </Badge>
              )}

              {isLocked && (
                <Badge variant="outline" className="text-label-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
                  <Lock className="size-3 mr-1 inline" />
                  Attendance Locked
                </Badge>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-headline-lg font-bold text-foreground tracking-tight">
                {event.title}
              </h1>
              <p className="text-body-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Facts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                <Calendar className="size-4 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                    Date &amp; Time (IST)
                  </span>
                  <span className="text-body-sm font-semibold text-foreground">
                    {formatDateIST(event.startsAt)}, {formatTimeIST(event.startsAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                <MapPin className="size-4 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                    Venue Location
                  </span>
                  <span className="text-body-sm font-semibold text-foreground truncate block">
                    {event.venue}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                <Clock className="size-4 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                    Service Credit
                  </span>
                  <span className="text-body-sm font-semibold text-foreground">
                    {event.hours ? `${event.hours} Hours Assigned` : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Consequential Action Buttons */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
            {!isLocked && status !== "CANCELLED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLockDialogOpen(true)}
                className="text-label-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-500/10"
              >
                <Lock className="size-3.5 mr-1.5" />
                Lock Attendance
              </Button>
            )}

            {status !== "CANCELLED" && status !== "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
                className="text-label-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <AlertOctagon className="size-3.5 mr-1.5" />
                Cancel Event
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog: Lock Attendance */}
      <ConfirmDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        title="Lock Attendance Register Early?"
        description="Locking attendance freezes the current roll call sheet. After lock, any attendance modifications require an audited correction with a minimum 10-character explanation (SRS §11.7)."
        confirmLabel="Lock Attendance Now"
        variant="default"
        onConfirm={handleConfirmLock}
      />

      {/* Confirmation Dialog: Cancel Event */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel This Scheduled Event?"
        description="Are you sure you want to cancel this event? This action will freeze attendance registers and notify enrolled volunteers. A cancellation reason will be recorded in the system audit logs."
        confirmLabel="Confirm Cancellation"
        variant="destructive"
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
