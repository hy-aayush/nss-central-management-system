"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_NAMES, type ProjectName } from "@/types/project";
import type { RosterEntry, UserRole, TechKind, BuilderKind } from "@/types/auth";

const roleAssignmentSchema = z.object({
  rollNumber: z.string().min(6, "Valid student roll number required (e.g. 2105999)"),
  role: z.enum(["COORDINATOR", "TECH_TEAM", "PROJECT_REPRESENTATIVE", "BUILDER"]),
  techKind: z.enum(["MEMBER", "MENTOR"]).optional(),
  builderKind: z.enum(["GENERAL", "POC", "DOMAIN_LEAD"]).optional(),
  projectScope: z.string().optional(),
  reason: z
    .string()
    .min(10, "Written justification of at least 10 characters required for audit policy")
    .max(300, "Reason cannot exceed 300 characters"),
});

type RoleAssignmentFormValues = z.infer<typeof roleAssignmentSchema>;

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: RosterEntry | null;
  onSuccess: (updatedEntry: RosterEntry) => void;
}

export function RoleAssignmentDialog({
  open,
  onOpenChange,
  entry,
  onSuccess,
}: RoleAssignmentDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const form = useForm<RoleAssignmentFormValues>({
    resolver: zodResolver(roleAssignmentSchema),
    values: {
      rollNumber: entry?.rollNumber ?? "",
      role: entry?.role ?? "PROJECT_REPRESENTATIVE",
      techKind: entry?.techKind ?? undefined,
      builderKind: entry?.builderKind ?? undefined,
      projectScope: entry?.projectScope?.[0] ?? "Dhara",
      reason: "",
    },
  });

  const formValues = useWatch({ control: form.control });
  const selectedRole = formValues.role;

  const handleFormSubmit = (data: RoleAssignmentFormValues) => {
    // If sensitive change (assigning Coordinator or Tech Mentor), require two-man confirmation alert
    if (data.role === "COORDINATOR" || (data.role === "TECH_TEAM" && data.techKind === "MENTOR")) {
      if (!requiresConfirmation) {
        setRequiresConfirmation(true);
        return;
      }
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setRequiresConfirmation(false);

      const updated: RosterEntry = entry
        ? {
            ...entry,
            role: data.role,
            techKind: data.role === "TECH_TEAM" ? data.techKind || "MEMBER" : null,
            builderKind: data.role === "BUILDER" ? data.builderKind || "POC" : null,
            projectScope:
              data.role === "PROJECT_REPRESENTATIVE" && data.projectScope ? [data.projectScope] : undefined,
            notes: data.reason,
          }
        : {
            id: Math.floor(Math.random() * 900) + 100,
            rollNumber: data.rollNumber,
            role: data.role,
            techKind: data.role === "TECH_TEAM" ? data.techKind || "MEMBER" : null,
            builderKind: data.role === "BUILDER" ? data.builderKind || "POC" : null,
            projectId: null,
            prSlot: null,
            domain: null,
            accessStatus: "ACTIVE",
            startsAt: new Date().toISOString(),
            endsAt: null,
            grantedBy: "2105999",
            endedBy: null,
            endReason: null,
            volunteer: {
              rollNumber: data.rollNumber,
              name: "Assigned Officer",
              project: (data.projectScope as ProjectName) || "Dhara",
            },
            projectScope:
              data.role === "PROJECT_REPRESENTATIVE" && data.projectScope ? [data.projectScope] : undefined,
            notes: data.reason,
          };

      onSuccess(updated);
      toast.success("Role Assignment Simulated", {
        description: `Updated role for ${updated.volunteer.name} (${updated.rollNumber}) to ${updated.role}. No persistent DB writes in demonstration mode.`,
      });
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4.5 text-primary" />
            <DialogTitle className="text-headline-sm font-semibold text-foreground">
              {entry ? "Modify Staff Role & Access Scope" : "Grant Office Roster Role"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Prototype role-assignment flow. Access is not granted until the server enforces the roster and permission checks in docs/PERMISSIONS.md.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Roll Number */}
          <div className="space-y-1.5">
            <Label htmlFor="rollNumber" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Student Roll Number
            </Label>
            <Input
              id="rollNumber"
              readOnly={!!entry}
              placeholder="e.g. 2105999"
              {...form.register("rollNumber")}
              className={`h-9 bg-background border-border font-mono text-body-sm ${
                entry ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            {form.formState.errors.rollNumber && (
              <p className="text-[11px] text-destructive">{form.formState.errors.rollNumber.message}</p>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operational Post Tier (Role)
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => form.setValue("role", val as UserRole)}
            >
              <SelectTrigger id="role" className="h-9 bg-background border-border text-label-sm">
                <SelectValue placeholder="Select target role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COORDINATOR">Student Coordinator (Tier 5)</SelectItem>
                <SelectItem value="TECH_TEAM">Tech Team (Tiers 4 &amp; 3)</SelectItem>
                <SelectItem value="PROJECT_REPRESENTATIVE">Project Representative (Tier 2)</SelectItem>
                <SelectItem value="BUILDER">Builder / POC (Tier 1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Sub-kind Conditionals */}
          {selectedRole === "TECH_TEAM" && (
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/50">
              <Label htmlFor="techKind" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tech Team Rank
              </Label>
              <Select
                value={formValues.techKind || "MEMBER"}
                onValueChange={(val) => form.setValue("techKind", val as TechKind)}
              >
                <SelectTrigger id="techKind" className="h-8.5 bg-background border-border text-label-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Tech Member (Tier 3 - Day-to-day operations)</SelectItem>
                  <SelectItem value="MENTOR">Tech Mentor (Tier 4 - Architecture &amp; Settings)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === "PROJECT_REPRESENTATIVE" && (
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/50">
              <Label htmlFor="projectScope" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Designated Project Wing (Exactly 2 PRs per Wing)
              </Label>
              <Select
                value={formValues.projectScope || "Dhara"}
                onValueChange={(val) => {
                  if (val) form.setValue("projectScope", val);
                }}
              >
                <SelectTrigger id="projectScope" className="h-8.5 bg-background border-border text-label-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_NAMES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === "BUILDER" && (
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/50">
              <Label htmlFor="builderKind" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Builder Responsibility
              </Label>
              <Select
                value={formValues.builderKind || "POC"}
                onValueChange={(val) => form.setValue("builderKind", val as BuilderKind)}
              >
                <SelectTrigger id="builderKind" className="h-8.5 bg-background border-border text-label-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POC">Point-of-Contact (Central Event Attendance)</SelectItem>
                  <SelectItem value="DOMAIN_LEAD">Domain Lead (Creative Wing Specialist)</SelectItem>
                  <SelectItem value="GENERAL">General Logistics Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Audit Reason Justification */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Policy Justification &amp; Authority Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="State reason for assignment, appointing authority (e.g. Director, Student Affairs), and operational scope..."
              {...form.register("reason")}
              className="min-h-20 text-body-sm bg-background border-border resize-none"
            />
            {form.formState.errors.reason && (
              <p className="text-[11px] text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          {/* Sensitive confirmation warning */}
          {requiresConfirmation && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-800 dark:text-amber-200 text-label-xs space-y-1.5 animate-in fade-in-50">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Sensitive Administrative Post Escalation</span>
              </div>
              <p className="leading-relaxed">
                Granting Coordinator (Tier 5) or Tech Mentor (Tier 4) grants elevated organizational authority, override rights on soft rules, and approval rights on destructive actions (SRS Section 4.3). Click &quot;Confirm &amp; Proceed&quot; to apply.
              </p>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-label-xs text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="size-3.5 text-muted-foreground shrink-0" />
            <span>Simulation Mode: Changes update client view only. No backend mutations occur in Part 1.</span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRequiresConfirmation(false);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Processing..." : requiresConfirmation ? "Confirm & Proceed" : "Apply Role Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
