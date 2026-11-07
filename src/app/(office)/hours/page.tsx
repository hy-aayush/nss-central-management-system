import { Clock } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function HoursPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow label="Service accounting" meta="Hours management" />
        }
        title="Service hours and adjustments"
        description="Event hours approval, category defaults, tagged manual adjustments, legacy imports, and yearly calibration."
      />

      <ModulePlaceholder
        icon={Clock}
        title="Hours calibration and approval"
        description="Event category defaults, grouped mega-event hours, coordinator sign-off, and per-volunteer yearly hour rollups."
        capabilities={[
          "Approve completed-event hours in bulk",
          "Apply tagged manual adjustments with a written reason",
          "Import legacy hour ledgers under an import batch",
          "Recalculate yearly totals after an approved change",
        ]}
        note="Approval and recomputation controls are not implemented in this frontend-only prototype. Figures shown elsewhere are synthetic."
      />
    </div>
  );
}
