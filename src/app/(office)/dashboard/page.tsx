import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DataQualityAlert } from "@/components/dashboard/data-quality-alert";
import {
  LazyGenderDonutChart,
  LazyMonthlyTrendsChart,
} from "@/components/dashboard/dashboard-charts";
import { requireOfficeAccess } from "@/lib/auth/actor";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { RecentAttendanceCard } from "@/components/dashboard/recent-attendance-card";
import { ProjectDistributionCard } from "@/components/dashboard/project-distribution-card";
import { RecentAuditCard } from "@/components/dashboard/recent-audit-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { getDashboardOverview } from "@/lib/mock-data/cached";
import {
  Users,
  Clock,
  TrendingUp,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Office Dashboard",
  description:
    "Internal office overview of volunteer deployment, events, verified attendance, and audit activity.",
};

const METRIC_ICONS = [Users, Clock, TrendingUp, CalendarCheck];

export const instant = false;

export default async function DashboardPage() {
  // Page-level gate: a layout alone can be bypassed by PPR streaming, so the
  // private page never renders (or serialises its data) before this check.
  const access = await requireOfficeAccess();
  // One cached read: the dataset *and* the filter/format/sort work behind the
  // hero all come from the same hourly cache window instead of being recomputed
  // on every request.
  const {
    snapshot: {
      summary,
      metricCards,
      events,
      meetings,
      projects,
      auditLogs,
      attendanceRecords,
      attendanceSummaries,
    },
    upcomingEvents,
    upcomingMeetings,
    nextOperation,
    academicYear,
  } = await getDashboardOverview();

  return (
    <div className="space-y-7">
      <DashboardHero
        name={access.volunteer.name}
        academicYear={academicYear}
        sessionLabel={`Session ${summary.academicYear}`}
        activeVolunteers={summary.volunteers.active}
        upcomingCount={upcomingEvents.length + upcomingMeetings.length}
        nextOperation={nextOperation}
      />

      {summary.dataQualityIssues.length > 0 ? (
        <DataQualityAlert issues={summary.dataQualityIssues} />
      ) : null}

      {/* Unit snapshot */}
      <section aria-labelledby="metrics-heading" className="space-y-3">
        <SectionHeader
          id="metrics-heading"
          eyebrow="This cycle"
          title="Unit snapshot"
          description="Verified figures for the current academic session, updated from the operational record."
          actions={
            <Link
              href="/analytics"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1 text-muted-foreground hover:text-foreground",
              })}
            >
              Open analytics
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card, idx) => {
            const Icon = METRIC_ICONS[idx % METRIC_ICONS.length];
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
                accent={idx === 0}
              />
            );
          })}
        </div>
      </section>

      {/* Visual analytics */}
      <section aria-labelledby="analytics-heading" className="space-y-3">
        <SectionHeader
          id="analytics-heading"
          eyebrow="Engagement"
          title="Participation and composition"
          description="Gender distribution of active volunteers alongside the monthly participation trajectory."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <LazyGenderDonutChart data={summary.volunteers.gender} className="h-full" />
          </div>
          <div className="flex flex-col lg:col-span-7">
            <LazyMonthlyTrendsChart
              trends={summary.monthlyTrends}
              className="h-full"
            />
          </div>
        </div>
      </section>

      {/* Operations */}
      <section aria-labelledby="operations-heading" className="space-y-3">
        <SectionHeader
          id="operations-heading"
          eyebrow="Operations"
          title="What is happening next"
          description="Scheduled drives and meetings beside the most recent verified attendance sessions."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UpcomingEventsCard events={events} meetings={meetings} limit={5} />
          <RecentAttendanceCard
            records={attendanceRecords}
            summaries={attendanceSummaries}
            limit={5}
          />
        </div>
      </section>

      {/* Project distribution — below the fold, so its first layout/paint pass
          is deferred until it approaches the viewport (`defer-render`). */}
      <section
        aria-labelledby="projects-heading"
        className="defer-render space-y-3"
      >
        <SectionHeader
          id="projects-heading"
          eyebrow="Programmes"
          title="Project capacity"
          description="All nine SDG-aligned project wings, their registers, and logged service hours."
        />
        <ProjectDistributionCard
          projects={projects}
          summaries={summary.projectSummaries}
        />
      </section>

      {/* Governance + shortcuts */}
      <section
        aria-labelledby="audit-heading"
        className="defer-render space-y-3"
      >
        <SectionHeader
          id="audit-heading"
          eyebrow="Governance"
          title="Shortcuts and accountability"
          description="Direct access to core workflows alongside the immutable audit trail."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-7">
            <QuickActionsCard />
          </div>
          <div className="flex flex-col lg:col-span-5">
            <RecentAuditCard logs={auditLogs} limit={5} />
          </div>
        </div>
      </section>
    </div>
  );
}
