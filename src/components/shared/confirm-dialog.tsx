"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  requireReason = false,
  reasonLabel = "Reason for action",
  reasonPlaceholder = "Provide justification as required by audit policies...",
  onConfirm,
  isLoading = false,
  trigger,
  children,
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState("");
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const effectiveLoading = isLoading || internalLoading;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError("Please provide a valid reason before proceeding.");
      return;
    }

    try {
      setInternalLoading(true);
      setError("");
      await onConfirm(reason.trim());
      setReason("");
      onOpenChange?.(false);
    } catch {
      setError("Action failed. Please check permissions or try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {(trigger || children) && (
        <DialogTrigger render={<>{trigger || children}</>} />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-foreground">
            {variant === "destructive" && (
              <div className="p-1.5 rounded-full bg-destructive/15 text-destructive shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
            )}
            <DialogTitle className="text-base font-semibold leading-none">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        {requireReason && (
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-reason" className="text-xs font-medium">
              {reasonLabel} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirm-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder={reasonPlaceholder}
              disabled={effectiveLoading}
              className="text-xs"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter className="flex-row justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={effectiveLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={effectiveLoading}
            className="gap-1.5"
          >
            {effectiveLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
