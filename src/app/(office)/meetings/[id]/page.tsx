import Link from "next/link";
import { ArrowLeft, CalendarX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_MEETINGS } from "@/lib/mock-data";
import { getMeetingSnapshot } from "@/lib/mock-data/cached";
import { MeetingWorkspace } from "@/features/meetings/meeting-workspace";
import { requireOfficeAccess } from "@/lib/auth/actor";

export async function generateStaticParams() {
  return MOCK_MEETINGS.map((meeting) => ({ id: String(meeting.id) }));
}

interface MeetingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const TABS = ["attendance", "minutes", "rules"] as const;

export const instant = false;

export default async function MeetingDetailPage({
  params,
  searchParams,
}: MeetingPageProps) {
  await requireOfficeAccess();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  // Cached per meeting id: the audience and counts are the same for every
  // viewer, so only the access gate is request-bound.
  const snapshot = await getMeetingSnapshot(id);

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <Link
          href="/meetings"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to meetings
        </Link>
        <EmptyState
          icon={CalendarX}
          title="Meeting not found"
          description={`No meeting matches id "${id}". It may have been removed, or the link is out of date.`}
          action={
            <Link href="/meetings" className={cn(buttonVariants({ size: "sm" }))}>
              Return to meetings
            </Link>
          }
        />
      </div>
    );
  }

  const tab = TABS.includes(query.tab as (typeof TABS)[number])
    ? (query.tab as string)
    : "attendance";

  return (
    <MeetingWorkspace
      meeting={snapshot.meeting}
      initialRows={snapshot.rows}
      defaultTab={tab}
    />
  );
}
