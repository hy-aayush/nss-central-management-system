import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Plus, Users } from "lucide-react";

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Member Directory</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">NSS Central Unit</span>
          </div>
        }
        title="Volunteers"
        description="Manage volunteer records, project affiliations, domain memberships and service status • 950 enrolled."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm">
              <Plus className="size-3.5 mr-1.5" />
              Add volunteer
            </Button>
          </>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <Users className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Volunteer Directory</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Roster records, TanStack table filtering, and volunteer profile views will be connected in the Volunteers phase.
        </p>
      </Card>
    </div>
  );
}
