import * as React from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SyntheticDataNotice } from "@/components/shared/synthetic-data-notice";
import { LazyToaster } from "@/components/ui/lazy-toaster";
import { ShortcutSheet } from "@/components/layout/shortcut-sheet";
import { requireOfficeAccess } from "@/lib/auth/actor";
import { initialsFromName, primaryRoleLabel } from "@/lib/auth/display";

/**
 * Private pages must never be prerendered or served as a static shell: the
 * session and the office assignment are checked at request time. Blocking
 * navigation here is deliberate (SRS 4.4 and 16.2) — this is an internal
 * office tool, not a public site.
 */
export const instant = false;

function ShellSkeleton() {
  return (
    <div className="h-14 w-full animate-pulse border-b border-border/60 bg-background/50 px-4 md:h-16 md:px-6" />
  );
}

function SidebarSkeleton() {
  return (
    <div className="hidden w-64 animate-pulse border-r border-border/60 bg-sidebar/50 md:flex" />
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

  // The sidebar already writes this cookie on every toggle; reading it back is
  // what stops a collapse from un-collapsing on every navigation or reload.
  // The sidebar already writes this cookie on every toggle; reading it back is
  // what stops a collapse from un-collapsing on every navigation or reload.
  const sidebarState = (await cookies()).get("sidebar_state")?.value;
  const sidebarOpen = sidebarState !== "false";

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
    <SidebarProvider defaultOpen={sidebarOpen}>
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <div className="relative flex min-h-screen w-full overflow-x-hidden bg-transparent">
        {/* Collapsible Desktop / Tablet Sidebar */}
        <Suspense fallback={<SidebarSkeleton />}>
          <AppSidebar actor={actor} />
        </Suspense>

        {/* Content Area with Sticky Topbar */}
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-transparent">
          <Suspense fallback={<ShellSkeleton />}>
            <Topbar actor={actor} />
          </Suspense>

          {/* Page Content Slot — fluid gutters, generous comfortable measure */}
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-[86rem] flex-1 px-4 pt-5 pb-28 outline-none sm:px-5 md:px-7 md:pt-6 md:pb-8 lg:px-9 lg:pt-8"
          >
            {/* Synthetic-data disclosure (SRS rule 20) — shown on every office screen */}
            <SyntheticDataNotice className="mb-5" />
            {children}
          </main>

          {/* Bottom Thumb Navigation for Mobile Devices */}
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>

          {/* Toast surface and shortcut help are both fetched on first use. */}
          <LazyToaster />
          <ShortcutSheet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
