import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ProjectStatsHeader } from "@/features/projects/project-stats-header";
import { ProjectGrid } from "@/features/projects/project-grid";
import { DomainRosterSection } from "@/features/projects/domain-roster-section";
import { getProjects, getCreativeDomains, getDashboardSummary } from "@/lib/mock-data";
import { CalendarPlus } from "lucide-react";

export const metadata = {
  title: "Projects & Domains | NSS Central Management System",
  description: "Internal office directory of 9 designated SDG project wings and 4 creative specialized domains.",
};

export default async function ProjectsPage() {
  const projects = getProjects();
  const domains = getCreativeDomains();
  const summary = getDashboardSummary();

  const totalVolunteers = summary.volunteers.active;
  const totalHours = summary.hours.totalAllocated;
  const totalEvents = summary.events.totalEvents;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-wider">Unit Operations</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-normal">9 Active Projects</span>
          </div>
        }
        title="Projects &amp; Creative Domains"
        description="Comprehensive directory of institutional community outreach wings, UN Sustainable Development Goals alignment, PR leadership, and domain coverage."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/events/central/new"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-xs font-medium",
              })}
            >
              <CalendarPlus className="size-3.5" />
              Schedule Event
            </Link>
          </div>
        }
      />

      {/* High-level KPI Statistics Header */}
      <ProjectStatsHeader
        projectCount={projects.length}
        totalVolunteers={totalVolunteers}
        totalHours={totalHours}
        totalEvents={totalEvents}
      />

      {/* 9 Designated SDG Projects Grid */}
      <section aria-labelledby="projects-list-heading" className="space-y-3">
        <h2 id="projects-list-heading" className="text-base font-semibold text-foreground">
          Designated Project Wings
        </h2>
        <ProjectGrid projects={projects} summaries={summary.projectSummaries} />
      </section>

      {/* 4 Specialized Creative Domains Section */}
      <section aria-labelledby="domains-heading" className="pt-2">
        <DomainRosterSection domains={domains} />
      </section>
    </div>
  );
}
