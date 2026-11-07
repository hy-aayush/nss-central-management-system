import React from "react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
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
          <PageEyebrow
            label="Access administration"
            meta="Approved roster · SRS §4"
          />
        }
        title="Staff directory and access governance"
        description="Office staff authorisation, role assignments (Coordinator, Tech Mentor/Member, Project PR, Builder/POC), and post tier governance."
      />

      <React.Suspense
        fallback={<LoadingState message="Streaming authorised staff roster…" />}
      >
        <TeamManager initialEntries={entries} />
      </React.Suspense>
    </div>
  );
}
