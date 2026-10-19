"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Building2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectAnalyticsSummary } from "@/types/analytics";

interface AnalyticsProjectComparisonProps {
  projects: ProjectAnalyticsSummary[];
}

export function AnalyticsProjectComparison({ projects }: AnalyticsProjectComparisonProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "volunteers" | "hours" | "turnout">("turnout");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.projectName.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

      switch (sortBy) {
        case "name":
          valA = a.projectName;
          valB = b.projectName;
          return sortOrder === "asc"
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        case "volunteers":
          valA = a.volunteersCount;
          valB = b.volunteersCount;
          break;
        case "hours":
          valA = a.hoursCompleted;
          valB = b.hoursCompleted;
          break;
        case "turnout":
          valA = a.attendanceRate ?? 0;
          valB = b.attendanceRate ?? 0;
          break;
      }

      return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return list;
  }, [projects, search, sortBy, sortOrder]);

  const toggleSort = (col: "name" | "volunteers" | "hours" | "turnout") => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="size-4.5 text-primary" />
            Cross-Project Performance Matrix
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Comparative analysis across all 9 designated community wings.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search wing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-body-sm bg-background border-border"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 overflow-hidden bg-background/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/80">
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1.5 text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Project Wing</span>
                  <ArrowUpDown className="size-3 text-muted-foreground/70" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("volunteers")}
              >
                <div className="flex items-center justify-end gap-1.5 text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Volunteers</span>
                  <ArrowUpDown className="size-3 text-muted-foreground/70" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Drives / Meets
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("hours")}
              >
                <div className="flex items-center justify-end gap-1.5 text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Hours Delivered</span>
                  <ArrowUpDown className="size-3 text-muted-foreground/70" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none w-48 text-right"
                onClick={() => toggleSort("turnout")}
              >
                <div className="flex items-center justify-end gap-1.5 text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Turnout Rate</span>
                  <ArrowUpDown className="size-3 text-muted-foreground/70" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                <span className="text-label-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gender Ratio
                </span>
              </TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((proj) => {
              const turnout = proj.attendanceRate ?? 0;
              return (
                <TableRow key={proj.projectName} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-label-sm">
                          {proj.projectName}
                        </span>
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 h-4 text-[10px] bg-primary/10 text-primary border-primary/20"
                        >
                          {proj.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        PRs: {proj.prNames.join(", ") || "Unassigned"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-mono font-medium text-foreground text-body-sm">
                      {proj.activeVolunteersCount}
                    </span>
                    <span className="text-label-xs text-muted-foreground"> / {proj.volunteersCount}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-mono text-body-sm text-foreground">
                      {proj.eventsCount}
                    </span>
                    <span className="text-label-xs text-muted-foreground"> / {proj.meetingsCount}</span>
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium text-foreground text-body-sm">
                    {proj.hoursCompleted.toLocaleString()}h
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-1.5 font-mono text-label-sm font-semibold">
                        <span
                          className={
                            turnout >= 90
                              ? "text-emerald-600 dark:text-emerald-400"
                              : turnout >= 80
                              ? "text-primary"
                              : "text-amber-600 dark:text-amber-400"
                          }
                        >
                          {turnout.toFixed(1)}%
                        </span>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            turnout >= 90
                              ? "bg-emerald-500"
                              : turnout >= 80
                              ? "bg-primary"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, turnout)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right text-label-xs text-muted-foreground">
                    <span>{proj.gender.male} M</span>
                    <span className="mx-1">•</span>
                    <span>{proj.gender.female} F</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Inspect project profile"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
