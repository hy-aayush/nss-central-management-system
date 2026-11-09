import Link from "next/link";
import { Plus } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getMeetingsSnapshot } from "@/lib/mock-data/cached";
import { MeetingsStatsHeader } from "@/features/meetings/meetings-stats-header";
import { MeetingsTable } from "@/features/meetings/meetings-table";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function MeetingsPage() {
  await requireOfficeAccess();
  const { meetings, listItems } = await getMeetingsSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        badge={<PageEyebrow label="Office operations" meta="Governance" />}
        title="Meetings and minutes"
        description="Project, central and builders meetings with a present-only roll call, a midnight IST lock, and a 100-word minutes record."
        actions={
          <Link
            href="/meetings/new"
            className={buttonVariants({ size: "sm", className: "gap-1.5" })}
          >
            <Plus className="size-3.5" />
            Schedule meeting
          </Link>
        }
      />

      <MeetingsStatsHeader meetings={meetings} />

      <MeetingsTable initialMeetings={listItems} />
    </div>
  );
}
