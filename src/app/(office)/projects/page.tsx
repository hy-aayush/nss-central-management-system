import * as React from "react";
import Link from "next/link";
import { PageEyebrow, PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { ProjectStatsHeader } from "@/features/projects/project-stats-header";
import { ProjectGrid } from "@/features/projects/project-grid";
import { DomainRosterSection } from "@/features/projects/domain-roster-section";
import {
  getProjects,
  getCreativeDomains,
  getDashboardSummary,
} from "@/lib/mock-data";
import { CalendarPlus } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

export const metadata = {
  title: "Projects and Domains",
  description:
    "Internal office directory of 9 designated SDG project wings and 4 creative specialised domains.",
};

export const instant = false;

export default async function ProjectsPage() {
  await requireOfficeAccess();
  const projects = getProjects();
  const domains = getCreativeDomains();
  const summary = getDashboardSummary();

  const totalVolunteers = summary.volunteers.active;
  const totalHours = summary.hours.totalAllocated;
  const totalEvents = summary.events.totalEvents;

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <PageEyebrow
            label="Unit operations"
            meta={`${projects.length} active projects`}
          />
        }
        title="Projects and creative domains"
        description="Directory of institutional community outreach wings, UN Sustainable Development Goal alignment, PR leadership, and domain coverage."
        actions={
          <Link
            href="/events/central/new"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5",
            })}
          >
            <CalendarPlus className="size-3.5" />
            Schedule event
          </Link>
        }
      />

      <ProjectStatsHeader
        projectCount={projects.length}
        totalVolunteers={totalVolunteers}
        totalHours={totalHours}
        totalEvents={totalEvents}
      />

      <section aria-labelledby="projects-list-heading" className="space-y-3">
        <SectionHeader
          id="projects-list-heading"
          eyebrow="Programmes"
          title="Designated project wings"
          description="Each wing owns a volunteer register, a pair of project representatives, and its own drive calendar."
        />
        <ProjectGrid projects={projects} summaries={summary.projectSummaries} />
      </section>

      <section aria-labelledby="domains-heading" className="space-y-3 pt-1">
        <SectionHeader
          id="domains-heading"
          eyebrow="Specialisations"
          title="Creative domains"
          description="Optional domain designations layered over a volunteer's project membership."
        />
        <DomainRosterSection domains={domains} />
      </section>
    </div>
  );
}
