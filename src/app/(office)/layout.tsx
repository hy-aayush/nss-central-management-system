import * as React from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SyntheticDataNotice } from "@/components/shared/synthetic-data-notice";
import { requireOfficeAccess } from "@/lib/auth/actor";
import {
  initialsFromName,
  primaryRoleLabel,
} from "@/lib/auth/display";

/**
 * Private pages must never be prerendered or served as a static shell: the
 * session and the office assignment are checked at request time. Blocking
 * navigation here is deliberate (SRS 4.4 and 16.2) — this is an internal
 * office tool, not a public site.
 */
export const instant = false;

function ShellSkeleton() {
  return (
    <div className="h-14 md:h-16 w-full border-b border-border/80 bg-background/50 px-4 md:px-6 animate-pulse" />
  );
}

function SidebarSkeleton() {
  return (
    <div className="hidden md:flex w-64 border-r border-border bg-surface-container-lowest animate-pulse" />
  );
}

export default async function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Never prerender the private shell. At build time this aborts prerendering;
  // at request time `requireOfficeAccess` verifies the session and the active
  // office assignment before anything private renders (SRS 4.4 and 16.2).
  await connection();
  const access = await requireOfficeAccess();

  const actor = {
    name: access.volunteer.name,
    email: access.identity.email,
    roleLabel: primaryRoleLabel(access.assignments),
    initials: initialsFromName(
      access.volunteer.name,
      access.volunteer.rollNumber,
    ),
  };

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <div className="relative flex min-h-screen w-full bg-background overflow-x-hidden">
        {/* Collapsible Desktop / Tablet Sidebar */}
        <Suspense fallback={<SidebarSkeleton />}>
          <AppSidebar actor={actor} />
        </Suspense>

        {/* Content Area with Sticky Topbar */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
          <Suspense fallback={<ShellSkeleton />}>
            <Topbar actor={actor} />
          </Suspense>

          {/* Page Content Slot */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 px-4 py-4 md:px-6 md:py-6 lg:px-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 outline-none"
          >
            {/* Synthetic-data disclosure (SRS rule 20) — shown on every office screen */}
            <SyntheticDataNotice className="mb-6" />
            {children}
          </main>

          {/* Bottom Thumb Navigation for Mobile Devices */}
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
