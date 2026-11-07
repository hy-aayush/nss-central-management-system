"use client";

import { useState } from "react";
import { Download, Calendar, Building2, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsKpiHeader } from "./analytics-kpi-header";
import { AnalyticsDefinitions } from "./analytics-definitions";
import { AnalyticsProjectComparison } from "./analytics-project-comparison";
import { AnalyticsMonthlyTrends } from "./analytics-monthly-trends";
import { AnalyticsDomainSummary } from "./analytics-domain-summary";
import type { DashboardSummary } from "@/types/analytics";

interface AnalyticsViewProps {
  summary: DashboardSummary;
}

export function AnalyticsView({ summary }: AnalyticsViewProps) {
  const [dateRange, setDateRange] = useState("ay-2026-27");
  const [activeTab, setActiveTab] = useState("projects");

  /**
   * Honest, bounded client-side export: the exact rows the screen is showing,
   * not a pretend server report. Replace with the server export endpoint when
   * the reporting service lands (SRS §13.3).
   */
  const handleExport = () => {
    const header = [
      "Project",
      "Volunteers",
      "Active volunteers",
      "Events",
      "Meetings",
      "Hours completed",
      "Attendance rate",
    ];
    const rows = summary.projectSummaries.map((project) => [
      project.projectName,
      project.volunteersCount,
      project.activeVolunteersCount,
      project.eventsCount,
      project.meetingsCount,
      project.hoursCompleted,
      project.attendanceRate ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `nss-projects-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Project summary exported", {
      description: `${rows.length} rows · synthetic data only · bounded export`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-3 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <Calendar
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.625rem] font-medium tracking-[0.075em] text-muted-foreground uppercase">
              Period
            </span>
            <Select
              value={dateRange}
              onValueChange={(val) => {
                if (val) setDateRange(val);
              }}
            >
              <SelectTrigger className="h-8 w-52 border-border/60 bg-surface-container-low/50 text-[0.75rem] font-medium shadow-none">
                <SelectValue placeholder="Select period…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ay-2026-27">
                  Academic year 2026–27 (full)
                </SelectItem>
                <SelectItem value="q1-2026">Q1 · Jul – Sep 2026</SelectItem>
                <SelectItem value="q2-2026">Q2 · Oct – Dec 2026</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-8 shrink-0 gap-1.5 self-start sm:self-auto"
        >
          <Download className="size-3.5" />
          Export project summary
        </Button>
      </div>

      {/* KPI Header */}
      <AnalyticsKpiHeader summary={summary} />

      {/* Definitions Component */}
      <AnalyticsDefinitions />

      {/* Interactive Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border/60 bg-card/70 p-1 backdrop-blur-sm">
          <TabsTrigger value="projects" className="gap-1.5 text-[0.6875rem]">
            <Building2 className="size-3.5" />
            <span>Projects ({summary.projectSummaries.length})</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 text-[0.6875rem]">
            <TrendingUp className="size-3.5" />
            <span>Monthly trends</span>
          </TabsTrigger>
          <TabsTrigger value="domains" className="gap-1.5 text-[0.6875rem]">
            <Sparkles className="size-3.5" />
            <span>Domains ({summary.domainSummaries.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-0">
          <AnalyticsProjectComparison projects={summary.projectSummaries} />
        </TabsContent>

        <TabsContent value="trends" className="mt-0">
          <AnalyticsMonthlyTrends trends={summary.monthlyTrends} />
        </TabsContent>

        <TabsContent value="domains" className="mt-0">
          <AnalyticsDomainSummary domains={summary.domainSummaries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
