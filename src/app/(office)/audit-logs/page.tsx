import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollText, Download } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Accountability</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Immutable History</span>
          </div>
        }
        title="Audit Logs"
        description="Immutable system-level audit logs tracking volunteer edits, attendance corrections, and administrative mutations."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-3.5 mr-1.5" />
            Export Audit Trail
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <ScrollText className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Audit Log Interface</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Detailed mutation snapshots, actor verification, and bounded exports will be implemented in the Audit Logs phase.
        </p>
      </Card>
    </div>
  );
}
