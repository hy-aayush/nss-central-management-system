import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectDetailHero } from "@/features/projects/project-detail-hero";
import { ProjectDetailTabs } from "@/features/projects/project-detail-tabs";
import {
  getProjects,
  getProjectBySlug,
  getVolunteersByProject,
  getEventsByProject,
  getMeetings,
  getDashboardSummary,
} from "@/lib/mock-data";
import { FolderX, ArrowLeft } from "lucide-react";

import { requireOfficeAccess } from "@/lib/auth/actor";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProjects().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | NSS Central Management System",
    };
  }

  return {
    title: `Project ${project.name} | NSS Central Management System`,
    description: `Official dashboard and volunteer roster for Project ${project.name} under NSS Central Operations.`,
  };
}

export const instant = false;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  await requireOfficeAccess();
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={FolderX}
          title="Project Wing Not Found"
          description={`No project wing found matching identifier "${slug}". Verify the project slug or return to the projects directory.`}
          action={
            <Link
              href="/projects"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-xs",
              })}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Projects Directory
            </Link>
          }
          className="bg-card border border-border/70 p-8 rounded-xl shadow-sm"
        />
      </div>
    );
  }

  // Retrieve project volunteers, events, meetings, and summary
  const volunteers = getVolunteersByProject(project.name);
  const events = getEventsByProject(project.name);
  const meetings = getMeetings({ project: project.name });
  const dashboardSummary = getDashboardSummary();
  const projectSummary = dashboardSummary.projectSummaries?.find(
    (s) => s.projectName.toLowerCase() === project.name.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Project Overview Hero Banner */}
      <ProjectDetailHero project={project} summary={projectSummary} />

      {/* Tabs: Assigned Volunteers, Events, Meetings, Domain Analytics */}
      <ProjectDetailTabs
        project={project}
        volunteers={volunteers}
        events={events}
        meetings={meetings.items}
        summary={projectSummary}
      />
    </div>
  );
}
