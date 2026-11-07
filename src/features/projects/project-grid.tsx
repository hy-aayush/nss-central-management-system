"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { GlassToolbar } from "@/components/ui/glass";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";
import type { ProjectAnalyticsSummary } from "@/types/analytics";

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
        p.sdgs.some(
          (sdg) => String(sdg).includes(q) || `sdg ${sdg}`.includes(q),
        ) ||
        p.representatives.some((r) => r.name.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  return (
    <div className="space-y-4">
      <GlassToolbar className="justify-between">
        <div className="relative w-full max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Search by project name, SDG number, or PR lead…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border-transparent bg-surface-container-low/60 pl-9 text-[0.75rem] shadow-none"
          />
        </div>

        <span className="tnum pr-1 text-[0.6875rem] text-muted-foreground">
          {filteredProjects.length} of {projects.length} wings
        </span>
      </GlassToolbar>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No matching projects"
          description="No project wing matches that search. Try a project name, an SDG number, or a representative's name."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((proj) => {
            const sum = summaryMap.get(proj.name);
            const prs =
              proj.representatives.map((r) => r.name).join(", ") || "Vacant";

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[var(--elevation-1)] transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--elevation-2)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-primary/70"
                        />
                        <h3 className="flex items-center gap-1.5 text-[0.9375rem] font-medium tracking-[-0.011em] text-foreground transition-colors group-hover:text-primary">
                          {proj.name}
                          <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {proj.sdgs.map((sdg) => (
                          <span
                            key={sdg}
                            className="inline-block rounded bg-surface-container-high/70 px-1.5 py-0.5 font-mono text-[0.5625rem] font-medium text-muted-foreground"
                          >
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <StatusBadge
                      status={proj.status}
                      type="volunteer"
                      className="shrink-0 px-1.5 py-0 text-[0.5625rem]"
                    />
                  </div>

                  <p className="line-clamp-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-border/50 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                        Volunteers
                      </p>
                      <p className="tnum text-[0.875rem] font-semibold text-foreground">
                        {proj.activeVolunteersCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                        Hours
                      </p>
                      <p className="tnum text-[0.875rem] font-semibold text-foreground">
                        {proj.totalHoursLogged}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.5625rem] tracking-[0.06em] text-muted-foreground uppercase">
                        Turnout
                      </p>
                      <p className="tnum text-[0.875rem] font-semibold text-foreground">
                        {sum?.attendanceRate ? `${sum.attendanceRate}%` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[0.625rem] text-muted-foreground">
                    <span className="max-w-[12rem] truncate">
                      PR:{" "}
                      <span className="font-medium text-foreground/90">
                        {prs}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-muted-foreground/70">
                      Wing #{proj.id}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
