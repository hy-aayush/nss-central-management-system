import * as React from "react";
import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

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

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <AppSidebar />
        </Suspense>

        {/* Content Area with Sticky Topbar */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
          <Suspense fallback={<ShellSkeleton />}>
            <Topbar />
          </Suspense>

          {/* Page Content Slot */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 px-4 py-4 md:px-6 md:py-6 lg:px-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 outline-none"
          >
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
