"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MeetingAudienceRow } from "@/lib/mock-data/meetings";
import {
  meetingCorrectionSchema,
  type MeetingCorrectionValues,
} from "./meeting-schemas";

interface MeetingCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: MeetingAudienceRow | null;
  onConfirm: (values: MeetingCorrectionValues) => void;
}

export function MeetingCorrectionDialog({
  open,
  onOpenChange,
  row,
  onConfirm,
}: MeetingCorrectionDialogProps) {
  const form = useForm<MeetingCorrectionValues>({
    resolver: zodResolver(meetingCorrectionSchema),
    defaultValues: { oldStatus: "ABSENT", newStatus: "PRESENT", reason: "" },
  });

  useEffect(() => {
    if (!row) return;
    form.reset({
      oldStatus: row.status,
      newStatus: row.status === "ABSENT" ? "PRESENT" : "ABSENT",
      reason: "",
    });
  }, [row, form]);

  const submit = (values: MeetingCorrectionValues) => {
    onConfirm(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-sm">
            Correct attendance
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            {row
              ? `${row.volunteer.name} (${row.volunteer.rollNumber}) — attendance is locked, so this change needs a reason.`
              : "Attendance is locked, so this change needs a reason."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-label-sm font-medium">Current</Label>
              <div className="flex h-8 items-center rounded-lg border border-border bg-muted/40 px-2.5 text-label-sm text-muted-foreground">
                {row?.status ?? "—"}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-label-sm font-medium">
                New status <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="newStatus"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                  >
                    <SelectTrigger className="w-full border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="EXCUSED">Excused</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.newStatus && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.newStatus.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="correctionReason"
              className="text-label-sm font-medium"
            >
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="correctionReason"
              rows={3}
              placeholder="At least 10 characters, for example: volunteer arrived late after the roll call closed."
              {...form.register("reason")}
              className="border-border bg-background"
            />
            {form.formState.errors.reason && (
              <p className="text-label-xs font-medium text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-label-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-label-sm">
              Save correction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
