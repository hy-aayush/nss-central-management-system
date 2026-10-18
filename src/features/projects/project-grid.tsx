"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Search, ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";
import type { ProjectAnalyticsSummary } from "@/types/analytics";
import { PROJECT_COLOR_MAP } from "@/lib/constants";

interface ProjectGridProps {
  projects: Project[];
  summaries?: ProjectAnalyticsSummary[];
}

export function ProjectGrid({ projects, summaries = [] }: ProjectGridProps) {
  const [search, setSearch] = React.useState("");
  const summaryMap = new Map(summaries.map((s) => [s.projectName, s]));

  const filteredProjects = React.useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sdgs.some((sdg) => String(sdg).includes(q) || `sdg ${sdg}`.includes(q)) ||
        p.representatives.some((r) => r.name.toLowerCase().includes(q))
    );
  }, [projects, search]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search projects by name, SDG number, or PR lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="text-xs text-muted-foreground self-end sm:self-auto font-mono">
          Showing {filteredProjects.length} of {projects.length} wings
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => {
          const sum = summaryMap.get(proj.name);
          const colorMeta = PROJECT_COLOR_MAP[proj.name] || {
            light: "bg-primary/10 text-primary",
            border: "border-primary/20",
          };
          const prs = proj.representatives.map((r) => r.name).join(", ") || "Vacant";

          return (
            <Link
              key={proj.id}
              href={`/projects/${proj.slug}`}
              className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="space-y-3">
                {/* Header: Project Name, Color Pill, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${colorMeta.light.split(" ")[0]}`} />
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {proj.name}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </h3>
                    </div>

                    {/* SDG Badges */}
                    <div className="flex flex-wrap gap-1">
                      {proj.sdgs.map((sdg) => (
                        <span
                          key={sdg}
                          className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                        >
                          SDG {sdg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <StatusBadge status={proj.status} type="volunteer" className="text-[10px] py-0 px-2 shrink-0" />
                </div>

                {/* Mission Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Metrics Bar & PR Leads Footer */}
              <div className="pt-3 mt-4 border-t border-border/50 space-y-2.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="block text-[10px] text-muted-foreground">Volunteers</span>
                    <span className="text-sm font-bold font-mono text-foreground">
                      {proj.activeVolunteersCount}
                    </span>
                  </div>

                  <div className="bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="block text-[10px] text-muted-foreground">Hours</span>
                    <span className="text-sm font-bold font-mono text-primary">
                      {proj.totalHoursLogged}
                    </span>
                  </div>

                  <div className="bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="block text-[10px] text-muted-foreground">Turnout</span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {sum?.attendanceRate ? `${sum.attendanceRate}%` : "91%"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="truncate max-w-[190px]">
                    PR: <strong className="text-foreground font-medium">{prs}</strong>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Wing #{proj.id}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
