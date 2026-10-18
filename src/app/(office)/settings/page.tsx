import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlidersHorizontal, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">System Preferences</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Internal Controls</span>
          </div>
        }
        title="Settings"
        description="Configure institute workspace rules, attendance thresholds, export row limits, and user preferences."
        actions={
          <Button size="sm">
            <Save className="size-3.5 mr-1.5" />
            Save Preferences
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <SlidersHorizontal className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Workspace Configuration</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          System policies, email domain restrictions, and audit retention controls will be connected in the Settings phase.
        </p>
      </Card>
    </div>
  );
}
