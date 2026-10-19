"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  attendanceCorrectionSchema,
  type AttendanceCorrectionFormValues,
} from "./attendance-schemas";
import type { AttendanceStatus, EventParticipant } from "@/types/event";

interface AttendanceCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: EventParticipant | null;
  onConfirmCorrection: (data: AttendanceCorrectionFormValues) => void;
}

export function AttendanceCorrectionDialog({
  open,
  onOpenChange,
  participant,
  onConfirmCorrection,
}: AttendanceCorrectionDialogProps) {
  const form = useForm<AttendanceCorrectionFormValues>({
    resolver: zodResolver(attendanceCorrectionSchema),
    values: {
      eventId: participant?.eventId ?? 1,
      rollNumber: participant?.volunteer.rollNumber ?? "",
      oldStatus: participant?.status ?? "ABSENT",
      newStatus: "PRESENT",
      reason: "",
    },
  });
  const newStatus = useWatch({ control: form.control, name: "newStatus" });

  if (!participant) return null;

  const handleSubmit = (data: AttendanceCorrectionFormValues) => {
    onConfirmCorrection(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-headline-sm">
            <ShieldAlert className="size-5 text-amber-500" />
            Attendance Correction Flow
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Attendance for locked drives requires an audited amendment with a written justification (SRS §11.7).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 my-2 text-body-sm">
          {/* Volunteer Overview */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{participant.volunteer.name}</p>
              <p className="text-label-xs text-muted-foreground font-mono">
                Roll: {participant.volunteer.rollNumber} • {participant.volunteer.project || "General"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
                Current Status
              </span>
              <Badge variant="outline" className="text-[11px] font-semibold mt-0.5">
                {participant.status}
              </Badge>
            </div>
          </div>

          {/* New Status Select */}
          <div className="space-y-1.5">
            <Label htmlFor="newStatus" className="text-label-sm font-medium">
              Corrected Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={newStatus}
              onValueChange={(val) => form.setValue("newStatus", val as AttendanceStatus)}
            >
              <SelectTrigger id="newStatus" className="bg-background border-border">
                <SelectValue placeholder="Select New Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">PRESENT (Attended)</SelectItem>
                <SelectItem value="ABSENT">ABSENT (Did Not Attend)</SelectItem>
                <SelectItem value="EXCUSED">EXCUSED (Authorized Absence)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justification Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-label-sm font-medium">
              Audit Reason Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Minimum 10 characters detailing why this change is necessary (e.g. Arrived on second shift with coordinator permission)..."
              {...form.register("reason")}
              className="bg-background border-border"
            />
            {form.formState.errors.reason ? (
              <p className="text-destructive text-label-xs font-medium">
                {form.formState.errors.reason.message}
              </p>
            ) : (
              <p className="text-muted-foreground text-[11px]">
                Reason will be recorded permanently in the system audit log with your account stamp.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-label-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-label-sm">
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Save Audited Correction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
