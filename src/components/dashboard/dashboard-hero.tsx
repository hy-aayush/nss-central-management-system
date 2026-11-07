import Link from "next/link";
import { ArrowUpRight, CalendarPlus, ClipboardCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardHeroOperation {
  title: string;
  when: string;
  venue: string;
  href: string;
  kind: string;
}

export interface DashboardHeroProps {
  name: string;
  academicYear: string;
  sessionLabel: string;
  activeVolunteers: number;
  upcomingCount: number;
  nextOperation?: DashboardHeroOperation;
  className?: string;
}

/**
 * The first thing a coordinator sees. One greeting, one sentence of context,
 * two actions, and the next scheduled operation — nothing else competes.
 */
export function DashboardHero({
  name,
  academicYear,
  sessionLabel,
  activeVolunteers,
  upcomingCount,
  nextOperation,
  className,
}: DashboardHeroProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <section
      aria-labelledby="dashboard-greeting"
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border/70 bg-card/75 p-5 shadow-[var(--elevation-1)] backdrop-blur-xl sm:p-6 lg:p-7",
        className,
      )}
    >
      {/* A single soft light source. Not a decorative blob: it gives the glass
          something to refract so the panel reads as a material. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-primary/[0.06] blur-3xl"
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.6875rem] font-medium tracking-[0.02em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              NSS Central Office
            </span>
            <span aria-hidden="true" className="text-border-strong">
              /
            </span>
            <span className="tnum">Academic year {academicYear}</span>
            <span aria-hidden="true" className="text-border-strong">
              /
            </span>
            <span>{sessionLabel}</span>
          </div>

          <h1 id="dashboard-greeting" className="text-display text-foreground">
            Welcome back, {firstName}.
          </h1>

          <p className="max-w-xl text-body-md leading-relaxed text-muted-foreground">
            You are overseeing{" "}
            <span className="font-medium text-foreground tnum">
              {activeVolunteers} active volunteers
            </span>{" "}
            with{" "}
            <span className="font-medium text-foreground tnum">
              {upcomingCount} upcoming operations
            </span>
            . Everything that needs attention is collected below.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/attendance"
              className={buttonVariants({
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <ClipboardCheck className="size-3.5" />
              Take attendance
            </Link>
            <Link
              href="/events/central/new"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <CalendarPlus className="size-3.5" />
              Schedule event
            </Link>
          </div>
        </div>

        {nextOperation ? (
          <div className="w-full shrink-0 lg:max-w-[19rem]">
            <div className="rounded-xl border border-border/60 bg-surface-container-low/50 p-3.5">
              <p className="text-eyebrow">Next operation</p>
              <Link
                href={nextOperation.href}
                className="group mt-2 block space-y-1"
              >
                <p className="flex items-start justify-between gap-2 text-[0.8125rem] leading-snug font-medium text-foreground transition-colors group-hover:text-primary">
                  <span className="line-clamp-2">{nextOperation.title}</span>
                  <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </p>
                <p className="tnum text-[0.6875rem] text-muted-foreground">
                  {nextOperation.when}
                </p>
                <p className="truncate text-[0.6875rem] text-muted-foreground/80">
                  {nextOperation.kind} · {nextOperation.venue}
                </p>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
