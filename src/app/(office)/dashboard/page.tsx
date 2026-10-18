import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Download, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Office Dashboard</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">NSS SCE Central</span>
          </div>
        }
        title="Operational Overview"
        description="Real-time operational summary, upcoming central sessions, and volunteer engagement status."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5 mr-1.5" />
              Export Summary
            </Button>
            <Button size="sm">
              <Plus className="size-3.5 mr-1.5" />
              New Central Event
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription>Enrolled Volunteers</CardDescription>
            <CardTitle className="text-2xl font-semibold">950</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="text-success font-medium">82.9% active</span> across 9 projects
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription>Scheduled Events</CardDescription>
            <CardTitle className="text-2xl font-semibold">7</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Next: Mega Plantation Drive
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription>Turnout Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold">89.8%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Average across last 7 central events
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed p-6 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <ShieldCheck className="size-5" />
        </div>
        <h3 className="text-headline-sm font-semibold">Application Shell Active</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          The navigation rail, responsive topbar, command search, breadcrumbs, and theme controls are fully operational.
        </p>
      </Card>
    </div>
  );
}
