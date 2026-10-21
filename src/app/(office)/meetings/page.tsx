import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function MeetingsPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Office Operations</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Governance</span>
          </div>
        }
        title="Meetings &amp; Minutes"
        description="Project, central, and builders meetings with roll-call attendance and verified minutes of meeting (MOM)."
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <CalendarCheck className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Tri-Partite Meetings Lifecycle</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Project meetings, Central meetings, and Builders meetings with MOM recording and present-only attendance tracking.
        </p>
        <p className="text-label-sm text-muted-foreground max-w-md mx-auto mt-3">
          Scheduling and attendance controls are not implemented in this frontend-only prototype.
        </p>
      </Card>
    </div>
  );
}
