import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Access Administration</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Approved Roster</span>
          </div>
        }
        title="Team &amp; Access"
        description="Office staff authorization, role assignments (Coordinator, Tech, Builder, Project PR), and roster gating."
        actions={
          <Button size="sm">
            <UserPlus className="size-3.5 mr-1.5" />
            Approve Access
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <ShieldCheck className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Team &amp; Authorization Management</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Roster approvals, role updates, and emergency access duration controls will be implemented in the Team phase.
        </p>
      </Card>
    </div>
  );
}
