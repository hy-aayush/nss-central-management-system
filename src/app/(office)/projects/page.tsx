import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderKanban, Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Unit Operations</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">9 Active Projects</span>
          </div>
        }
        title="Projects & Domains"
        description="Configure unit projects, project PR assignments, and creative domain rosters."
        actions={
          <Button size="sm">
            <Plus className="size-3.5 mr-1.5" />
            Create Project
          </Button>
        }
      />

      <Card className="border-dashed p-8 text-center bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <FolderKanban className="size-6" />
        </div>
        <h3 className="text-headline-md font-semibold text-foreground">Projects Overview</h3>
        <p className="text-body-sm text-muted-foreground max-w-md mx-auto mt-1">
          Project records, domain allocations, and project-specific events will be implemented in the Projects phase.
        </p>
      </Card>
    </div>
  );
}
