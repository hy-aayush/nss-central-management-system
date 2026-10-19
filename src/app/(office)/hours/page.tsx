import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function HoursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Service Accounting</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Hours Management</span>
          </div>
        }
        title="Service Hours &amp; Adjustments"
        description="Event hours approval, category defaults, tagged manual adjustments, legacy imports, and yearly calibration."
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <Clock className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Hours Calibration &amp; Approval</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Event category defaults, group mega-event hours, coordinator sign-offs, and volunteer yearly hour rollups.
        </p>
        <p className="text-label-sm text-muted-foreground max-w-md mx-auto mt-3">
          Approval and recomputation controls are not implemented in this frontend-only prototype.
        </p>
      </Card>
    </div>
  );
}
