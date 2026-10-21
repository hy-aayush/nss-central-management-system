import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { DataQualityAlert } from "@/components/dashboard/data-quality-alert";
import {
  LazyGenderDonutChart,
  LazyMonthlyTrendsChart,
} from "@/components/dashboard/dashboard-charts";
import { academicYearLabel } from "@/lib/time";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { RecentAttendanceCard } from "@/components/dashboard/recent-attendance-card";
import { ProjectDistributionCard } from "@/components/dashboard/project-distribution-card";
import { RecentAuditCard } from "@/components/dashboard/recent-audit-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import {
  getDashboardSummary,
  getMetricCards,
  getEvents,
  getMeetings,
  getProjects,
  getAuditLogs,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTENDANCE_SUMMARIES,
} from "@/lib/mock-data";
import {
  Users,
  Clock,
  TrendingUp,
  CalendarCheck,
  CalendarPlus,
  ClipboardCheck,
} from "lucide-react";

export const metadata = {
  title: "Office Dashboard | NSS Central Management System",
  description: "Internal office overview of volunteer deployment, events, verified attendance, and audit activity.",
};

const METRIC_ICONS = [Users, Clock, TrendingUp, CalendarCheck];
const METRIC_COLORS = ["text-blue-500", "text-emerald-500", "text-purple-500", "text-amber-500"];

export default async function DashboardPage() {
  // Server-side retrieval of synthetic mock datasets through typed query helpers
  const summary = getDashboardSummary();
  const metricCards = getMetricCards();
  const events = getEvents().items;
  const meetings = getMeetings().items;
  const projects = getProjects();
  const auditLogs = getAuditLogs().items;

  return (
    <div className="space-y-6">
      {/* Header with Title, Context, and Primary Operational Actions */}
      <PageHeader
        badge={
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-foreground font-semibold">NSS Central Office</span>
            <span className="text-muted-foreground">•</span>
            {/* Derived from the data snapshot, not `new Date()`: Cache Components
                forbids reading the clock during prerender (SRS 16.4). */}
            <span className="text-muted-foreground font-mono">Academic Year {academicYearLabel(summary.lastUpdated)}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">IST (UTC+05:30)</span>
          </div>
        }
        title="Operational Dashboard"
        description="Central office command center: volunteer totals, project distribution, verified event turnout, and security logs."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/attendance"
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-medium" })}
            >
              <ClipboardCheck className="size-3.5" />
              Take Attendance
            </Link>
            <Link
              href="/events/central/new"
              className={buttonVariants({ variant: "default", size: "sm", className: "gap-1.5 text-xs font-medium" })}
            >
              <CalendarPlus className="size-3.5" />
              Schedule Event
            </Link>
          </div>
        }
      />      {/* Operational Action Items & Data Quality Alerts */}
      <DataQualityAlert issues={summary.dataQualityIssues} />

      {/* Top Summary Metric Cards */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Core Operational Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, idx) => {
            const Icon = METRIC_ICONS[idx % METRIC_ICONS.length];
            const iconColor = METRIC_COLORS[idx % METRIC_COLORS.length];
            return (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                change={card.change}
                changeType={card.changeType}
                changePeriod={card.changePeriod}
                description={card.description}
                icon={Icon}
                iconColor={iconColor}
              />
            );
          })}
        </div>
      </section>

      {/* Visual Analytics Row: Gender Diversity Donut & Monthly Trajectory Area Chart */}
      <section aria-labelledby="analytics-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <h2 id="analytics-heading" className="sr-only">Visual Analytics and Engagement Trends</h2>
        <div className="lg:col-span-5 flex flex-col">
          <LazyGenderDonutChart data={summary.volunteers.gender} className="h-full" />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <LazyMonthlyTrendsChart trends={summary.monthlyTrends} className="h-full" />
        </div>
      </section>

      {/* Operations Row: Upcoming Events/Meetings & Recent Verified Attendance */}
      <section aria-labelledby="operations-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <h2 id="operations-heading" className="sr-only">Upcoming and Recent Operations</h2>
        <UpcomingEventsCard events={events} meetings={meetings} limit={5} />
        <RecentAttendanceCard
          records={MOCK_ATTENDANCE_RECORDS}
          summaries={MOCK_ATTENDANCE_SUMMARIES}
          limit={5}
        />
      </section>

      {/* Project Distribution Section (All 9 SDG Project Wings) */}
      <section aria-labelledby="projects-heading">
        <h2 id="projects-heading" className="sr-only">Project Wings Capacity</h2>
        <ProjectDistributionCard
          projects={projects}
          summaries={summary.projectSummaries}
        />
      </section>

      {/* Quick Office Shortcuts & Security Audit Activity */}
      <section aria-labelledby="audit-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <h2 id="audit-heading" className="sr-only">Governance and Shortcuts</h2>
        <div className="lg:col-span-7 flex flex-col">
          <QuickActionsCard />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <RecentAuditCard logs={auditLogs} limit={5} />
        </div>
      </section>
    </div>
  );
}
