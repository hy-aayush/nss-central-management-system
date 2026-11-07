import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Layers,
  LayoutGrid,
  Palette,
  ShieldCheck,
  Sparkles,
  Type,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass";
import { Separator } from "@/components/ui/separator";
import { requireOfficeAccess } from "@/lib/auth/actor";

/** The root page reads the session; it is never prerendered. */
export const instant = false;

const TYPE_SPECIMENS = [
  { token: "text-display", label: "32–40 / fluid", sample: "National Service Scheme", className: "text-display" },
  { token: "text-headline-lg", label: "21–26 / fluid", sample: "Volunteer and project operations", className: "text-headline-lg" },
  { token: "text-headline-md", label: "16–18 / fluid", sample: "Central event attendance records", className: "text-headline-md" },
  { token: "text-body-lg", label: "15 / 1.55", sample: "Manage volunteer profiles, historical participation, and service records.", className: "text-body-lg" },
  { token: "text-body-md", label: "13 / 1.5", sample: "Standard table density and descriptive content across the office portal.", className: "text-body-md" },
  { token: "text-body-sm", label: "13 / 1.45", sample: "Helper text and secondary descriptions.", className: "text-body-sm" },
  { token: "text-label-sm", label: "11 / tracked", sample: "Interactive labels and filter headers", className: "text-label-sm uppercase tracking-[0.06em]" },
  { token: "text-code-sm", label: "12 mono", sample: "0x4F9B7A_AUDIT_TRANSACTION_ID", className: "text-code-sm text-muted-foreground" },
];

export default async function DesignSystemPage() {
  // The design reference is internal too (SRS 18.5): only office users see it.
  await requireOfficeAccess();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[0.8125rem] font-semibold tracking-[-0.01em]">
                  NSS Central Management System
                </span>
                <Badge
                  variant="outline"
                  className="hidden rounded px-1.5 text-[0.5625rem] tracking-[0.08em] uppercase sm:inline-flex"
                >
                  Design system v2
                </Badge>
              </div>
              <p className="text-[0.6875rem] text-muted-foreground">
                Liquid glass · internal office interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden sm:block">
              <Button size="sm" className="gap-1.5">
                Open office shell
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-5 py-10 lg:px-8 lg:py-14">
        {/* Intro */}
        <section className="space-y-4">
          <p className="text-eyebrow">Foundation</p>
          <h1 className="text-display max-w-2xl text-foreground">
            Minimal liquid glass, built for daily operational work.
          </h1>
          <p className="max-w-2xl text-body-lg leading-relaxed text-muted-foreground">
            A restrained material system for an internal academic product: quiet
            surfaces, one accent, fluid typography, and motion that only exists
            to explain a change of state. Glass is reserved for things that
            float above the page.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="gap-1.5 rounded px-2 py-1 text-[0.625rem]">
              <Sparkles className="size-3 text-primary" />
              WCAG AA contrast
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded px-2 py-1 text-[0.625rem]">
              prefers-reduced-motion honoured
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded px-2 py-1 text-[0.625rem]">
              light and dark parity
            </Badge>
          </div>
        </section>

        {/* Glass layers */}
        <section className="space-y-5">
          <SectionLabel icon={Layers} title="Glass layers" />
          <div className="grid gap-4 md:grid-cols-3">
            <GlassPanel tone="quiet" padding="lg" className="space-y-2">
              <p className="text-eyebrow">Level 1 · quiet</p>
              <p className="text-headline-sm text-foreground">Content surface</p>
              <p className="text-body-sm text-muted-foreground">
                Barely tinted, 10px blur. Cards in the normal page flow. Reading
                surfaces stay opaque enough to hold long text.
              </p>
              <code className="text-code-sm block pt-2 text-muted-foreground/70">
                .glass-quiet
              </code>
            </GlassPanel>

            <GlassPanel tone="panel" padding="lg" className="space-y-2">
              <p className="text-eyebrow">Level 2 · panel</p>
              <p className="text-headline-sm text-foreground">Floating panel</p>
              <p className="text-body-sm text-muted-foreground">
                22px blur with a soft top sheen. Sidebar, sticky toolbars, and
                dashboard widgets that sit above the canvas.
              </p>
              <code className="text-code-sm block pt-2 text-muted-foreground/70">
                .glass-panel
              </code>
            </GlassPanel>

            <GlassPanel tone="overlay" padding="lg" className="space-y-2">
              <p className="text-eyebrow">Level 3 · overlay</p>
              <p className="text-headline-sm text-foreground">Transient layer</p>
              <p className="text-body-sm text-muted-foreground">
                Highest opacity and blur. Dialogs, command menu, popovers — where
                legibility must never depend on what is behind.
              </p>
              <code className="text-code-sm block pt-2 text-muted-foreground/70">
                .glass-overlay
              </code>
            </GlassPanel>
          </div>
          <p className="text-[0.6875rem] text-muted-foreground">
            Every layer falls back to a solid card surface when{" "}
            <code className="text-code-sm">backdrop-filter</code> is
            unavailable. Glass is never the only thing making text readable.
          </p>
        </section>

        {/* Typography */}
        <section className="space-y-5">
          <SectionLabel icon={Type} title="Fluid typography" />
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80">
            {TYPE_SPECIMENS.map((row, index) => (
              <div
                key={row.token}
                className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 md:flex-row md:items-baseline md:gap-6"
              >
                <div className="flex w-52 shrink-0 flex-col gap-0.5">
                  <code className="text-code-sm text-foreground">{row.token}</code>
                  <span className="text-[0.625rem] text-muted-foreground">
                    {row.label}
                  </span>
                </div>
                <span className={`${row.className} min-w-0 text-foreground`}>
                  {row.sample}
                </span>
                {index === TYPE_SPECIMENS.length - 1 ? null : (
                  <span className="hidden" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[0.6875rem] text-muted-foreground">
            Headline sizes use <code className="text-code-sm">clamp()</code> so
            the scale breathes with the viewport instead of snapping at
            breakpoints. Body copy stays at a fixed, comfortable measure.
          </p>
        </section>

        {/* Palette */}
        <section className="space-y-5">
          <SectionLabel icon={Palette} title="One accent, four statuses" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SwatchCard
              label="Primary"
              value="--primary"
              description="Studio blue, AA on white and dark canvases"
              className="bg-primary text-primary-foreground"
            />
            <SwatchCard
              label="Success"
              value="--success"
              description="Present, active, approved"
              className="bg-success text-success-foreground"
            />
            <SwatchCard
              label="Warning"
              value="--warning"
              description="Pending, excused, review required"
              className="bg-warning text-warning-foreground"
            />
            <SwatchCard
              label="Destructive"
              value="--destructive"
              description="Absent, suspended, cancelled"
              className="bg-destructive text-destructive-foreground"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ToneRow icon={CheckCircle2} label="Active" tone="success" badge="PRESENT" />
            <ToneRow icon={AlertTriangle} label="Pending" tone="warning" badge="EXCUSED" />
            <ToneRow icon={XCircle} label="Terminated" tone="danger" badge="ABSENT" />
            <ToneRow icon={Info} label="Informational" tone="info" badge="SCHEDULED" />
          </div>
        </section>

        {/* Components */}
        <section className="space-y-5">
          <SectionLabel icon={LayoutGrid} title="Controls" />
          <GlassPanel tone="quiet" padding="lg" className="space-y-6">
            <div className="space-y-2.5">
              <p className="text-label-sm text-muted-foreground">Buttons</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="sm">Small</Button>
                <Button size="xs" variant="outline">
                  Extra small
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <p className="text-label-sm text-muted-foreground">Status badges</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="destructive">Suspended</Badge>
                <Badge variant="info">Scheduled</Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <p className="text-label-sm text-muted-foreground">
                Radii — nothing above 18px
              </p>
              <div className="flex flex-wrap gap-2">
                {["xs 4", "sm 6", "md 8", "lg 10", "xl 12", "2xl 16", "3xl 18"].map(
                  (radius) => (
                    <div
                      key={radius}
                      className="flex size-16 items-center justify-center border border-border/70 bg-surface-container-low/60 text-code-sm text-muted-foreground"
                      style={{
                        borderRadius: `var(--radius-${radius.split(" ")[0]})`,
                      }}
                    >
                      {radius.split(" ")[0]}
                    </div>
                  ),
                )}
              </div>
            </div>
          </GlassPanel>
        </section>

        <footer className="flex flex-col justify-between gap-2 border-t border-border/60 pt-6 text-[0.6875rem] text-muted-foreground sm:flex-row">
          <span>NSS Central Management System · design foundation v2</span>
          <span>Next.js App Router · Tailwind CSS v4 · Base UI</span>
        </footer>
      </main>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-headline-sm text-foreground">{title}</h2>
    </div>
  );
}

function SwatchCard({
  label,
  value,
  description,
  className,
}: {
  label: string;
  value: string;
  description: string;
  className: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/80">
      <div className={`flex h-16 items-end p-3 text-[0.6875rem] font-medium ${className}`}>
        {label}
      </div>
      <div className="space-y-0.5 border-t border-border/60 p-3">
        <code className="text-code-sm block text-foreground">{value}</code>
        <p className="text-[0.625rem] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

const TONE_CLASS = {
  success: "border-success/25 bg-success-container/40 text-on-success-container",
  warning: "border-warning/25 bg-warning-container/40 text-on-warning-container",
  danger: "border-destructive/25 bg-error-container/40 text-on-error-container",
  info: "border-info/25 bg-info-container/40 text-on-info-container",
} as const;

function ToneRow({
  icon: Icon,
  label,
  tone,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: keyof typeof TONE_CLASS;
  badge: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${TONE_CLASS[tone]}`}>
      <span className="flex items-center gap-2 text-[0.75rem] font-medium">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="rounded bg-card/60 px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-wide">
        {badge}
      </span>
    </div>
  );
}
