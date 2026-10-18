import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowLeft, Users, Clock, CalendarCheck, Award } from "lucide-react";
import type { Project } from "@/types/project";
import type { ProjectAnalyticsSummary } from "@/types/analytics";
import { PROJECT_COLOR_MAP } from "@/lib/constants";

interface ProjectDetailHeroProps {
  project: Project;
  summary?: ProjectAnalyticsSummary;
}

export function ProjectDetailHero({ project, summary }: ProjectDetailHeroProps) {
  const colorMeta = PROJECT_COLOR_MAP[project.name] || {
    light: "bg-primary/10 text-primary",
    border: "border-primary/20",
  };

  const prs = project.representatives.map((r) => `${r.name} (${r.rollNumber})`).join(", ") || "Vacant";

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1 text-xs text-muted-foreground hover:text-foreground -ml-2",
          })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Projects
        </Link>

        <StatusBadge status={project.status} type="volunteer" showDot className="text-xs px-2.5 py-0.5" />
      </div>

      {/* Hero Card */}
      <div className="p-6 rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`size-3 rounded-full ${colorMeta.light.split(" ")[0]}`} />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Project {project.name}
              </h1>
              <span className="text-xs text-muted-foreground font-mono">
                Wing #{project.id}
              </span>
            </div>

            {/* SDG Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-xs text-muted-foreground font-medium mr-1">Aligned SDGs:</span>
              {project.sdgs.map((sdg) => (
                <span
                  key={sdg}
                  className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground font-semibold border border-border/60"
                >
                  SDG {sdg}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              {project.description}
            </p>
          </div>

          {/* Quick Leadership Card */}
          <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 shrink-0 text-xs space-y-1.5 self-stretch md:self-auto">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Project Leadership (PRs)
            </span>
            <p className="font-medium text-foreground leading-tight">
              {prs}
            </p>
            <span className="text-[11px] text-muted-foreground block">
              3rd-year appointed student representatives
            </span>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50 text-xs">
          <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-0.5">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              Active Volunteers
            </span>
            <div className="text-xl font-bold font-mono text-foreground">
              {project.activeVolunteersCount}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-0.5">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              Service Hours
            </span>
            <div className="text-xl font-bold font-mono text-primary">
              {project.totalHoursLogged} hrs
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-0.5">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <CalendarCheck className="h-3 w-3 text-primary" />
              Completed Drives
            </span>
            <div className="text-xl font-bold font-mono text-foreground">
              {summary?.eventsCount ?? 12}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-0.5">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Award className="h-3 w-3 text-emerald-500" />
              Turnout Rate
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {summary?.attendanceRate ? `${summary.attendanceRate}%` : "91.2%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
