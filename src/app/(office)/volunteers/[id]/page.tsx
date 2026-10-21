import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { VolunteerProfileHeader } from "@/features/volunteers/volunteer-profile-header";
import { VolunteerDetailCards } from "@/features/volunteers/volunteer-detail-cards";
import { VolunteerHistoryTabs } from "@/features/volunteers/volunteer-history-tabs";
import {
  getVolunteers,
  getVolunteerByRoll,
  getVolunteerEvents,
  getMeetings,
  getVolunteerAuditLogs,
} from "@/lib/mock-data";
import { UserX, ArrowLeft } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

interface VolunteerDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getVolunteers().items.map((v) => ({
    id: v.rollNumber,
  }));
}

export async function generateMetadata({ params }: VolunteerDetailPageProps) {
  const { id } = await params;
  const volunteer = getVolunteerByRoll(id);

  if (!volunteer) {
    return {
      title: "Volunteer Not Found | NSS Central Management System",
    };
  }

  return {
    title: `${volunteer.name} (${volunteer.rollNumber}) | NSS Central Management System`,
    description: `Official profile and service ledger for volunteer ${volunteer.name}, affiliated with Project ${volunteer.project}.`,
  };
}

export const instant = false;

export default async function VolunteerDetailPage({ params }: VolunteerDetailPageProps) {
  await requireOfficeAccess();
  const { id } = await params;
  const volunteer = getVolunteerByRoll(id);

  if (!volunteer) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={UserX}
          title="Volunteer Record Not Found"
          description={`No volunteer profile found matching roll number "${id}". The student may have been archived or the roll number was mistyped.`}
          action={
            <Link
              href="/volunteers"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-xs",
              })}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Volunteer Directory
            </Link>
          }
          className="bg-card border border-border/70 p-8 rounded-xl shadow-sm"
        />
      </div>
    );
  }

  // Retrieve participation, meetings, and audit history
  const events = getVolunteerEvents(volunteer.rollNumber);
  const meetings = getMeetings(volunteer.project ? { project: volunteer.project } : undefined);
  const auditLogs = getVolunteerAuditLogs(volunteer.rollNumber);

  return (
    <div className="space-y-6">
      {/* Volunteer Profile Header Banner */}
      <VolunteerProfileHeader volunteer={volunteer} />

      {/* Active Service Status, Hours & Coordinator Notes */}
      <VolunteerDetailCards volunteer={volunteer} />

      {/* Historical Records Tabs: Events, Meetings, Hours, Audit */}
      <VolunteerHistoryTabs
        volunteer={volunteer}
        events={events}
        meetings={meetings.items}
        auditLogs={auditLogs}
      />
    </div>
  );
}
