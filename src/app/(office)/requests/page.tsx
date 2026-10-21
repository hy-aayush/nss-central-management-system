import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Inbox } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function RequestsPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Governance</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Approvals</span>
          </div>
        }
        title="Requests &amp; Approvals"
        description="Two-man rule workflows for volunteer suspension, archival, and permanent deletion with coordinator sign-off."
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <Inbox className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Two-Man Rule Request Inbox</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Tech team initiates requests with written justification; Coordinators approve or reject with permanent audit trails.
        </p>
        <p className="text-label-sm text-muted-foreground max-w-md mx-auto mt-3">
          Request creation and approval controls are not implemented in this frontend-only prototype.
        </p>
      </Card>
    </div>
  );
}
