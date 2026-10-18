import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Download } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Office Intelligence</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Analytics &amp; Metrics</span>
          </div>
        }
        title="Analytics &amp; Reports"
        description="Cross-project volunteer turnout rates, domain engagement distributions, and service hour records."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-3.5 mr-1.5" />
            Export Analytics
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <BarChart3 className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Analytics Overview</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Turnout distribution charts, gender ratios, and participation breakdown will be implemented in the Analytics phase.
        </p>
      </Card>
    </div>
  );
}
