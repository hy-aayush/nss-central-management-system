import { Inbox } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function RequestsPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={<PageEyebrow label="Governance" meta="Approvals" />}
        title="Requests and approvals"
        description="Two-man rule workflows for volunteer suspension, archival, and permanent deletion with coordinator sign-off."
      />

      <ModulePlaceholder
        icon={Inbox}
        title="Two-man rule request inbox"
        description="The Tech Team raises a request with written justification; a Coordinator approves or rejects it. Both decisions are written to the permanent audit trail."
        capabilities={[
          "Raise suspension, archival, and deletion requests",
          "Require a second officer to approve every destructive action",
          "Show request age and escalation state",
          "Link each decision to its immutable audit entry",
        ]}
        note="Request creation and approval controls are not implemented in this frontend-only prototype. The queue count in navigation is illustrative."
      />
    </div>
  );
}
