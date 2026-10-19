"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, Power, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function SettingsEmergencyCard() {
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleKillSwitch = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setKillSwitchActive(!killSwitchActive);
    setDialogOpen(false);
    toast.warning(
      !killSwitchActive
        ? "Emergency Kill Switch Activated (Simulated)"
        : "Emergency Kill Switch Deactivated (Simulated)",
      {
        description:
          "Circuit breaker simulation toggled. Backend database circuit breakers and RLS enforcement activate upon database integration.",
      }
    );
  };

  return (
    <Card className="p-6 bg-card border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
        <div>
          <h3 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="size-4.5 text-amber-600 dark:text-amber-400" />
            Emergency Mode &amp; Circuit Breakers
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Emergency kill switch controls and task-specific emergency packs (SRS §4.9).
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 text-label-xs self-start sm:self-auto font-semibold"
        >
          UI Simulation Only
        </Badge>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 dark:text-amber-200 text-body-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4.5 shrink-0" />
          <span>Part 1 Architecture Notice: Operational Circuit Breakers</span>
        </div>
        <p className="text-label-xs leading-relaxed">
          Emergency mode and kill switches shown here are frontend architectural demonstrations. <strong>Do not claim that kill switches, quota checks, or emergency mode work until the production backend and database exist.</strong> Actual circuit breaker enforcement relies on PostgreSQL row-level security and middleware policies currently scheduled for Part 2.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FCFS Registration Kill Switch */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-label-sm text-foreground flex items-center gap-1.5">
              <Power className="size-4 text-primary" />
              Global FCFS Registration Circuit Breaker
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4.5 font-semibold ${
                killSwitchActive
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300"
              }`}
            >
              {killSwitchActive ? "CIRCUIT TRIPPED" : "NORMAL"}
            </Badge>
          </div>

          <p className="text-label-xs text-muted-foreground leading-relaxed">
            Immediately locks all active FCFS queues organization-wide in case of database surge or unexpected traffic spike.
          </p>

          <Button
            type="button"
            variant={killSwitchActive ? "default" : "destructive"}
            size="sm"
            onClick={handleToggleKillSwitch}
            className="w-full text-label-xs h-8.5 gap-1.5"
          >
            <Power className="size-3.5" />
            <span>{killSwitchActive ? "Restore Normal FCFS Queues" : "Trip FCFS Emergency Lock"}</span>
          </Button>
        </div>

        {/* Emergency Pack Delegation */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-label-sm text-foreground flex items-center gap-1.5">
              <Lock className="size-4 text-primary" />
              Emergency Access Scope Delegation
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 bg-muted/40 text-muted-foreground">
              Max 24h
            </Badge>
          </div>

          <p className="text-label-xs text-muted-foreground leading-relaxed">
            Short-lived grants for single tasks (e.g. <code>EVENT_ATTENDANCE</code>, <code>MEETING_RUN</code>). Automatically deprovisioned upon duration expiry.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("Emergency Pack Delegation", {
                description:
                  "Delegation wizard will link with backend ActorContext resolver in Part 2.",
              })
            }
            className="w-full text-label-xs h-8.5 gap-1.5"
          >
            <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Inspect Active Emergency Packs (2 active)</span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={killSwitchActive ? "Restore FCFS Registration?" : "Trip FCFS Circuit Breaker?"}
        description={
          killSwitchActive
            ? "Restoring FCFS queues will resume registration windows for published upcoming events."
            : "Tripping the circuit breaker simulates an emergency shutdown of all FCFS rush registrations across all 9 wings. This action is audited."
        }
        confirmLabel={killSwitchActive ? "Restore Normal" : "Trip Circuit Breaker"}
        variant={killSwitchActive ? "default" : "destructive"}
        onConfirm={handleConfirm}
      />
    </Card>
  );
}
