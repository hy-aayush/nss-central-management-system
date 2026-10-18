import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCheck, Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Attendance Register</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Present / Absent / Excused</span>
          </div>
        }
        title="Attendance &amp; Hours"
        description="Event attendance marking, correction audit trails, and allocated service hours verification."
        actions={
          <Button size="sm">
            <Clock className="size-3.5 mr-1.5" />
            Mark Session
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <UserCheck className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Attendance Register</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Attendance marking sessions, correction history reasons, and hours approval will be implemented in the Attendance phase.
        </p>
      </Card>
    </div>
  );
}
