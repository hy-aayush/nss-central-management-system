import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { Project } from "@/types/project";
import type { ProjectAnalyticsSummary } from "@/types/analytics";

interface ProjectDistributionCardProps {
  projects: Project[];
  summaries?: ProjectAnalyticsSummary[];
}

export function ProjectDistributionCard({
  projects,
  summaries,
}: ProjectDistributionCardProps) {
  const summaryMap = new Map(summaries?.map((s) => [s.projectName, s]) || []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2">
            <FolderKanban
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Project operations and capacity
          </CardTitle>
          <CardDescription>
            Nine SDG-aligned initiatives with active registers and service hours
          </CardDescription>
        </div>
        <Link
          href="/projects"
          className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          All projects
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const summary = summaryMap.get(project.name);
            const representatives =
              project.representatives.map((r) => r.name).join(", ") || "Vacant";

            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group flex flex-col gap-2.5 rounded-xl border border-border/60 bg-surface-container-low/30 p-3.5 transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-[var(--elevation-1)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-foreground transition-colors group-hover:text-primary">
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-primary/70"
                      />
                      <span className="truncate">{project.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.sdgs.slice(0, 3).map((sdg) => (
                        <span
                          key={sdg}
                          className="rounded bg-surface-container-high/70 px-1 py-px font-mono text-[0.5625rem] text-muted-foreground"
                        >
                          SDG {sdg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge
                    status={project.status}
                    type="volunteer"
                    className="shrink-0 px-1.5 py-0 text-[0.5625rem]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-2">
                  <div>
                    <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                      Volunteers
                    </p>
                    <p className="tnum text-[0.8125rem] font-semibold text-foreground">
                      {project.activeVolunteersCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                      Hours
                    </p>
                    <p className="tnum text-[0.8125rem] font-semibold text-foreground">
                      {project.totalHoursLogged}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                      Turnout
                    </p>
                    <p className="tnum text-[0.8125rem] font-semibold text-foreground">
                      {summary?.attendanceRate ? `${summary.attendanceRate}%` : "—"}
                    </p>
                  </div>
                </div>

                <p className="truncate text-[0.625rem] text-muted-foreground/80">
                  PRs: {representatives}
                </p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
