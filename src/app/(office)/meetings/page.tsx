import { CalendarCheck } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function MeetingsPage() {
  await requireOfficeAccess();
  return (
    <div className="space-y-6">
      <PageHeader
        badge={<PageEyebrow label="Office operations" meta="Governance" />}
        title="Meetings and minutes"
        description="Project, central, and builders meetings with roll-call attendance and verified minutes of meeting."
      />

      <ModulePlaceholder
        icon={CalendarCheck}
        title="Tri-partite meetings lifecycle"
        description="Project meetings, central meetings, and builders meetings, each with a present-only attendance register and a signed minutes of meeting record."
        capabilities={[
          "Schedule project, central, and builders meetings",
          "Present-only roll call with the same lock rules as events",
          "Minutes of meeting authoring and sign-off",
          "Turnout comparison across meeting types",
        ]}
        note="Scheduling and attendance controls are not implemented in this frontend-only prototype. No button on this screen is active."
      />
    </div>
  );
}
