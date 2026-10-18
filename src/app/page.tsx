import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldCheck,
  Sparkles,
  Layers,
  Palette,
  Type,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
      {/* Restrained Glass Header */}
      <header className="sticky top-0 z-40 w-full glass-surface border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="text-headline-sm font-semibold tracking-tight">
                  NSS Central Management System
                </span>
                <Badge variant="accent" className="font-mono text-[10px]">
                  DESIGN FOUNDATION
                </Badge>
              </div>
              <p className="text-label-sm text-muted-foreground">
                Internal Office Interface • Asia/Kolkata (IST)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
                <span>Open Office Shell</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              <span>WCAG AAA / AA Accessible</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-space-lg py-space-xl space-y-space-2xl">
        {/* Foundation Hero Intro */}
        <section className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1">
              <Sparkles className="size-3 text-primary" />
              <span>Design System Token Architecture</span>
            </Badge>
            <Link href="/dashboard">
              <Badge variant="accent" className="cursor-pointer hover:opacity-85 py-1">
                Go to Office Shell (/dashboard) →
              </Badge>
            </Link>
          </div>
          <h1 className="text-display tracking-tight text-foreground">
            Foundation & Visual Tokens
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-3xl">
            Strict, high-density design tokens crafted for internal office operations.
            Featuring neutral surfaces, a single authoritative indigo accent, clear status colours,
            restrained glassmorphism, accessible focus rings, and strict reduced-motion adherence.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="gap-2">
                <span>Enter Office Management Shell</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 1. Single Accent Colour & Surfaces */}
        <section className="space-y-space-md">
          <div className="flex items-center gap-space-xs">
            <Palette className="size-5 text-primary" />
            <h2 className="text-headline-md font-semibold">1. Single Accent Colour & Neutral Surfaces</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Primary Accent Card */}
            <Card className="glass-card shadow-xs">
              <CardHeader className="pb-space-xs">
                <CardTitle className="text-headline-sm flex items-center justify-between">
                  <span>Primary Accent</span>
                  <span className="size-3 rounded-full bg-primary" />
                </CardTitle>
                <CardDescription>Authoritative Deep Indigo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-space-xs">
                <div className="h-12 w-full rounded-md bg-primary flex items-center justify-center text-primary-foreground font-medium text-body-sm shadow-inner">
                  Primary Solid (WCAG AAA)
                </div>
                <div className="h-10 w-full rounded-md bg-primary-container flex items-center justify-center text-on-primary-container font-medium text-label-sm">
                  Container Subtle
                </div>
                <div className="flex justify-between text-label-sm text-muted-foreground pt-1">
                  <span>Token</span>
                  <code className="text-code-sm">--primary</code>
                </div>
              </CardContent>
            </Card>

            {/* Surface Hierarchy Lowest */}
            <Card className="bg-surface-container-lowest shadow-xs border">
              <CardHeader className="pb-space-xs">
                <CardTitle className="text-headline-sm">Surface Lowest</CardTitle>
                <CardDescription>Primary card and dialog canvas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-space-xs">
                <div className="p-space-sm rounded-md bg-surface-container-low border text-body-sm text-foreground">
                  Recessed area: container-low
                </div>
                <div className="flex justify-between text-label-sm text-muted-foreground pt-2">
                  <span>Token</span>
                  <code className="text-code-sm">--surface-lowest</code>
                </div>
              </CardContent>
            </Card>

            {/* Surface Container Mid */}
            <Card className="bg-surface-container shadow-xs border">
              <CardHeader className="pb-space-xs">
                <CardTitle className="text-headline-sm">Surface Container</CardTitle>
                <CardDescription>Sectional grouping & tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-space-xs">
                <div className="p-space-sm rounded-md bg-surface-container-high border text-body-sm text-foreground">
                  Elevated row / header
                </div>
                <div className="flex justify-between text-label-sm text-muted-foreground pt-2">
                  <span>Token</span>
                  <code className="text-code-sm">--surface-container</code>
                </div>
              </CardContent>
            </Card>

            {/* Restrained Glass Card */}
            <Card className="glass-card shadow-xs">
              <CardHeader className="pb-space-xs">
                <CardTitle className="text-headline-sm">Restrained Glass</CardTitle>
                <CardDescription>Subtle 12px blur + 82% alpha</CardDescription>
              </CardHeader>
              <CardContent className="space-y-space-xs">
                <div className="glass-surface p-space-sm rounded-md border text-body-sm text-foreground text-center">
                  Floating element backdrop
                </div>
                <div className="flex justify-between text-label-sm text-muted-foreground pt-2">
                  <span>Utility</span>
                  <code className="text-code-sm">glass-card</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. Clear Status Colours */}
        <section className="space-y-space-md">
          <div className="flex items-center gap-space-xs">
            <Layers className="size-5 text-primary" />
            <h2 className="text-headline-md font-semibold">2. Operational Status Colours</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Success */}
            <div className="rounded-xl border bg-card p-space-md shadow-xs space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-label-md font-semibold text-success">
                  <CheckCircle2 className="size-4" />
                  <span>Success / Active</span>
                </span>
                <Badge variant="success">PRESENT</Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Approved volunteer hours, verified status, active memberships.
              </p>
              <div className="rounded-md bg-success/10 border border-success/20 p-2 text-label-sm text-success font-medium">
                High-contrast contrast ratio &gt; 5.0:1
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-xl border bg-card p-space-md shadow-xs space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-label-md font-semibold text-warning-foreground dark:text-warning">
                  <AlertTriangle className="size-4 text-warning" />
                  <span>Warning / Pending</span>
                </span>
                <Badge variant="warning">EXCUSED</Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Draft events, pending approvals, attendance corrections.
              </p>
              <div className="rounded-md bg-warning/10 border border-warning/20 p-2 text-label-sm text-warning-foreground dark:text-warning font-medium">
                Amber status for review required
              </div>
            </div>

            {/* Error / Destructive */}
            <div className="rounded-xl border bg-card p-space-md shadow-xs space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-label-md font-semibold text-destructive">
                  <XCircle className="size-4" />
                  <span>Error / Terminated</span>
                </span>
                <Badge variant="destructive">ABSENT</Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Suspended volunteers, cancelled events, audit violations.
              </p>
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-label-sm text-destructive font-medium">
                Crimson alert for destructive states
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl border bg-card p-space-md shadow-xs space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-label-md font-semibold text-info">
                  <Info className="size-4" />
                  <span>Informational</span>
                </span>
                <Badge variant="info">SCHEDULED</Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Domains, central meetings, office notes, informational logs.
              </p>
              <div className="rounded-md bg-info/10 border border-info/20 p-2 text-label-sm text-info font-medium">
                Azure slate for non-urgent context
              </div>
            </div>
          </div>
        </section>

        {/* 3. Typography Hierarchy */}
        <section className="space-y-space-md">
          <div className="flex items-center gap-space-xs">
            <Type className="size-5 text-primary" />
            <h2 className="text-headline-md font-semibold">3. Typography Scale (Inter & JetBrains Mono)</h2>
          </div>

          <Card className="shadow-xs overflow-hidden">
            <div className="divide-y text-body-sm">
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-display (32/40)</span>
                <span className="text-display text-foreground">National Service Scheme</span>
                <span className="text-label-sm text-muted-foreground">Inter 600 • -0.025em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-headline-lg (24/32)</span>
                <span className="text-headline-lg text-foreground">Volunteers &amp; Project Operations</span>
                <span className="text-label-sm text-muted-foreground">Inter 600 • -0.02em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-headline-md (18/24)</span>
                <span className="text-headline-md text-foreground">Central Event Attendance Records</span>
                <span className="text-label-sm text-muted-foreground">Inter 600 • -0.015em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-headline-sm (15/20)</span>
                <span className="text-headline-sm text-foreground">Coordinator Access Authorization</span>
                <span className="text-label-sm text-muted-foreground">Inter 600 • -0.01em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-body-lg (15/22)</span>
                <span className="text-body-lg text-foreground">Manage volunteer profiles, historical participation, and service records.</span>
                <span className="text-label-sm text-muted-foreground">Inter 400 • -0.005em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-body-md (13/18)</span>
                <span className="text-body-md text-foreground">Standard table row density and descriptive content throughout the office portal.</span>
                <span className="text-label-sm text-muted-foreground">Inter 400 • 0em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-label-md (13/18)</span>
                <span className="text-label-md text-foreground">Interactive Labels &amp; Filter Headers</span>
                <span className="text-label-sm text-muted-foreground">Inter 500 • -0.005em</span>
              </div>
              <div className="p-space-md flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs">
                <span className="text-code-sm text-muted-foreground w-40 shrink-0">text-code-sm (12/16)</span>
                <span className="text-code-sm text-muted-foreground">0x4F9B7A_AUDIT_TRANSACTION_ID</span>
                <span className="text-label-sm text-muted-foreground">JetBrains Mono 400</span>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Interactive Components & Focus Rings */}
        <section className="space-y-space-md">
          <div className="flex items-center gap-space-xs">
            <LayoutGrid className="size-5 text-primary" />
            <h2 className="text-headline-md font-semibold">4. Base-Nova Components &amp; Keyboard Focus</h2>
          </div>

          <Card className="p-space-lg space-y-space-lg shadow-xs">
            {/* Buttons */}
            <div className="space-y-space-xs">
              <span className="text-label-md font-semibold text-foreground">Button Hierarchy &amp; Focus Visible States</span>
              <p className="text-body-sm text-muted-foreground">
                Press Tab to test visible focus rings (<code className="text-code-sm">focus-visible:ring-ring</code>).
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <Button variant="default">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline Action</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="destructive">Destructive Action</Button>
                <Button variant="default" size="sm">Small</Button>
                <Button variant="outline" size="xs">Extra Small</Button>
                <Button disabled variant="default">Disabled</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-space-xs pt-space-sm border-t">
              <span className="text-label-md font-semibold text-foreground">Operational Status Badges</span>
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="accent">Accent Container</Badge>
                <Badge variant="success">Active (Success)</Badge>
                <Badge variant="warning">Pending (Warning)</Badge>
                <Badge variant="destructive">Suspended (Destructive)</Badge>
                <Badge variant="info">Domain (Info)</Badge>
              </div>
            </div>

            {/* Spacing & Radii Grid */}
            <div className="space-y-space-xs pt-space-sm border-t">
              <span className="text-label-md font-semibold text-foreground">Corner Radii Scale</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-space-xs pt-space-xs text-center">
                <div className="rounded-xs border bg-surface-container-low p-space-sm text-label-sm">xs (4px)</div>
                <div className="rounded-sm border bg-surface-container-low p-space-sm text-label-sm">sm (6px)</div>
                <div className="rounded-md border bg-surface-container-low p-space-sm text-label-sm">md (8px)</div>
                <div className="rounded-lg border bg-surface-container-low p-space-sm text-label-sm">lg (10px)</div>
                <div className="rounded-xl border bg-surface-container-low p-space-sm text-label-sm">xl (12px)</div>
                <div className="rounded-2xl border bg-surface-container-low p-space-sm text-label-sm">2xl (16px)</div>
                <div className="rounded-full border bg-surface-container-low p-space-sm text-label-sm">full (pill)</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer info */}
        <footer className="pt-space-md border-t flex flex-col sm:flex-row items-center justify-between text-label-sm text-muted-foreground gap-space-xs">
          <span>NSS Central Management System • Baseline Phase</span>
          <span>Next.js App Router • Tailwind CSS v4 • Base-Nova</span>
        </footer>
      </main>
    </div>
  );
}
