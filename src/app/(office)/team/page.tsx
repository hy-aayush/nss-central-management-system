import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { getRosterEntries } from "@/lib/mock-data";
import { TeamManager } from "@/features/team/team-manager";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function TeamPage() {
  await requireOfficeAccess();
  const entries = getRosterEntries();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-label-sm text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Access Administration</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">Approved Roster (SRS §4)</span>
          </div>
        }
        title="Staff Directory &amp; Access Governance"
        description="Office staff authorization, role assignments (Coordinator, Tech Mentor/Member, Project PR, Builder/POC), and post tier governance."
      />

      <React.Suspense fallback={<LoadingState message="Streaming authorized staff roster..." />}>
        <TeamManager initialEntries={entries} />
      </React.Suspense>
    </div>
  );
}

