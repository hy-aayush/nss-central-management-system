"use client";

import { useState } from "react";
import { Sliders, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SettingsGuardrailsForm() {
  const [fcfsDuration, setFcfsDuration] = useState("60");
  const [maxCollab, setMaxCollab] = useState("2");
  const [momWindowDays, setMomWindowDays] = useState("7");
  const [editBudget, setEditBudget] = useState("2");
  const [absenceThreshold, setAbsenceThreshold] = useState("2");
  const [domainTenureHours, setDomainTenureHours] = useState("40");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Operational Guardrails Saved", {
        description: "Updated soft-rules policies (S-01 through S-09). Simulated client state in Part 1.",
      });
    }, 400);
  };

  return (
    <Card className="p-6 bg-card border-border shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <h3 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders className="size-4.5 text-primary" />
            Soft Rules &amp; Operational Guardrails (SRS §3.2)
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Default operational boundaries. Coordinators can override any soft rule with written justification.
          </p>
        </div>

        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-label-xs self-start sm:self-auto">
          9 Guardrails Active
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* S-02: FCFS Lock Duration */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-02</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">FCFS Window</span>
            </div>
            <Label htmlFor="fcfsDuration" className="text-label-sm font-medium text-foreground block">
              Default FCFS Window (Minutes)
            </Label>
            <Input
              id="fcfsDuration"
              type="number"
              min="15"
              max="1440"
              value={fcfsDuration}
              onChange={(e) => setFcfsDuration(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Closes automatically at <code>fcfs_lock_at</code>. Coordinator can reopen or insert walk-ins.
            </p>
          </div>

          {/* S-03: Max Collaborators */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-03</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Collaboration</span>
            </div>
            <Label htmlFor="maxCollab" className="text-label-sm font-medium text-foreground block">
              Max Collaborating Wings
            </Label>
            <Input
              id="maxCollab"
              type="number"
              min="1"
              max="8"
              value={maxCollab}
              onChange={(e) => setMaxCollab(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              1 host + max 2 collaborators (3 wings max). Coordinator override required for 4+ wing mega drives.
            </p>
          </div>

          {/* S-05: MOM Editing Window */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-05</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Minutes of Meeting</span>
            </div>
            <Label htmlFor="momWindowDays" className="text-label-sm font-medium text-foreground block">
              MOM Submission Window (Days)
            </Label>
            <Input
              id="momWindowDays"
              type="number"
              min="1"
              max="30"
              value={momWindowDays}
              onChange={(e) => setMomWindowDays(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Meeting minutes lock 7 days after conclusion. Revision requires coordinator budget approval.
            </p>
          </div>

          {/* S-06: Edit Budget */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-06</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Edit Budget</span>
            </div>
            <Label htmlFor="editBudget" className="text-label-sm font-medium text-foreground block">
              Subsequent Edits Allowed
            </Label>
            <Input
              id="editBudget"
              type="number"
              min="1"
              max="5"
              value={editBudget}
              onChange={(e) => setEditBudget(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              PRs and Builders are granted 2 saved edits after initial creation before requiring coordinator unlocks.
            </p>
          </div>

          {/* S-08: Consecutive Absence Review */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-08</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Absence Review</span>
            </div>
            <Label htmlFor="absenceThreshold" className="text-label-sm font-medium text-foreground block">
              Consecutive Absence Alert (Meets)
            </Label>
            <Input
              id="absenceThreshold"
              type="number"
              min="1"
              max="5"
              value={absenceThreshold}
              onChange={(e) => setAbsenceThreshold(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              2 unexcused meeting absences trigger review by Coordinator for suspension or red flag placement.
            </p>
          </div>

          {/* S-09: Minimum Domain Lead Tenure */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-xs font-semibold text-foreground font-mono">S-09</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Domain Lead Rule</span>
            </div>
            <Label htmlFor="domainTenureHours" className="text-label-sm font-medium text-foreground block">
              Min Hours for Domain Lead
            </Label>
            <Input
              id="domainTenureHours"
              type="number"
              min="20"
              max="100"
              value={domainTenureHours}
              onChange={(e) => setDomainTenureHours(e.target.value)}
              className="h-8.5 bg-background border-border font-mono text-body-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              &gt;40 service hours and 3+ months active membership required to qualify as creative Domain Lead.
            </p>
          </div>
        </div>

        {/* Notice and Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-label-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <span>
              All rule parameter changes are recorded permanently in the security audit ledger with officer ID.
            </span>
          </div>

          <Button type="submit" disabled={saving} size="sm" className="gap-1.5 shadow-xs">
            <Save className="size-3.5" />
            <span>{saving ? "Updating..." : "Save Guardrail Configuration"}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
