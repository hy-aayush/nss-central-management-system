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

  const handleExport = () => {
    toast.success("Institutional Analytics Report Exported", {
      description: "Generated synthetic analytics summary CSV (bounded export per SRS §13.3).",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar className="size-4.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Reporting Time Horizon (IST)
            </span>
            <Select value={dateRange} onValueChange={(val) => { if (val) setDateRange(val); }}>
              <SelectTrigger className="w-56 h-8.5 bg-background border-border text-label-sm font-medium">
                <SelectValue placeholder="Select period..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ay-2026-27">Academic Year 2026-27 (Full)</SelectItem>
                <SelectItem value="q1-2026">Q1 (July - September 2026)</SelectItem>
                <SelectItem value="q2-2026">Q2 (October - December 2026)</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days (Rolling)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-8.5 text-label-xs self-start sm:self-auto gap-1.5"
        >
          <Download className="size-3.5 text-primary" />
          Export Bounded Summary (CSV)
        </Button>
      </div>

      {/* KPI Header */}
      <AnalyticsKpiHeader summary={summary} />

      {/* Definitions Component */}
      <AnalyticsDefinitions />

      {/* Interactive Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border/60">
          <TabsTrigger value="projects" className="gap-1.5 text-label-xs">
            <Building2 className="size-3.5" />
            <span>Project Comparisons ({summary.projectSummaries.length})</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 text-label-xs">
            <TrendingUp className="size-3.5" />
            <span>Monthly Trends</span>
          </TabsTrigger>
          <TabsTrigger value="domains" className="gap-1.5 text-label-xs">
            <Sparkles className="size-3.5" />
            <span>Creative Domains ({summary.domainSummaries.length})</span>
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
