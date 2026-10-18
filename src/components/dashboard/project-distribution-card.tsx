import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { Project } from "@/types/project";
import type { ProjectAnalyticsSummary } from "@/types/analytics";
import { PROJECT_COLOR_MAP } from "@/lib/constants";

interface ProjectDistributionCardProps {
  projects: Project[];
  summaries?: ProjectAnalyticsSummary[];
}

export function ProjectDistributionCard({ projects, summaries }: ProjectDistributionCardProps) {
  // Merge project details with their summary metrics if available
  const summaryMap = new Map(summaries?.map((s) => [s.projectName, s]) || []);

  return (
    <Card className="border border-border/70 bg-card/75 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-title-sm font-semibold text-foreground flex items-center gap-1.5">
              <FolderKanban className="size-4 text-primary" />
              Project Operations &amp; Capacity
            </CardTitle>
            <CardDescription className="text-body-xs text-muted-foreground">
              9 designated SDG initiatives with active volunteer registers and hours
            </CardDescription>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-body-xs font-medium text-primary hover:underline"
          >
            All 9 projects
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((proj) => {
            const sum = summaryMap.get(proj.name);
            const colorMeta = PROJECT_COLOR_MAP[proj.name] || { light: "bg-primary/10 text-primary", border: "border-primary/20" };
            const prs = proj.representatives.map((r) => r.name).join(", ") || "Vacant";

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.slug}`}
                className="group block p-3.5 rounded-lg border border-border/60 bg-surface/50 hover:bg-surface hover:border-border transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-body-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span className={`inline-block size-2 rounded-full ${colorMeta.light.split(" ")[0]}`} />
                      {proj.name}
                      <ArrowRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {proj.sdgs.map((sdg) => (
                        <span
                          key={sdg}
                          className="inline-block text-[10px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground font-medium"
                        >
                          SDG {sdg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={proj.status} type="volunteer" className="text-[10px]" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                  <div>
                    <span className="block text-body-xs text-muted-foreground">Volunteers</span>
                    <span className="text-label-md font-mono font-bold text-foreground">
                      {proj.activeVolunteersCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-body-xs text-muted-foreground">Hours</span>
                    <span className="text-label-md font-mono font-bold text-primary">
                      {proj.totalHoursLogged}
                    </span>
                  </div>
                  <div>
                    <span className="block text-body-xs text-muted-foreground">Turnout</span>
                    <span className="text-label-md font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {sum?.attendanceRate ? `${sum.attendanceRate}%` : "91%"}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[170px]">PRs: {prs}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/70">
                    ID #{proj.id}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
