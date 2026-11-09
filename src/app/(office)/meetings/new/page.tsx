import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MeetingForm } from "@/features/meetings/meeting-form";
import { requireOfficeAccess } from "@/lib/auth/actor";

export const instant = false;

export default async function NewMeetingPage() {
  await requireOfficeAccess();

  return (
    <div className="space-y-6">
      <Link
        href="/meetings"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 px-2 text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowLeft className="mr-1.5 size-4" />
        Back to meetings
      </Link>

      <PageHeader
        badge={<PageEyebrow label="Meeting scheduler" meta="Stored lifecycle" />}
        title="Schedule a meeting"
        description="Choose the type, audience and slot. The status changes only when someone starts, ends or cancels it."
      />

      <MeetingForm />
    </div>
  );
}
