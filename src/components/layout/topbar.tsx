"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "@/lib/navigation";
import { CommandMenu } from "@/components/layout/command-menu";
import { NotificationPopover } from "@/components/layout/notification-popover";
import { IstClock } from "@/components/layout/ist-clock";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** Display-only identity for the signed-in office member. */
export interface TopbarActor {
  name: string;
  initials: string;
}

export function Topbar({ actor }: { actor: TopbarActor }) {
  const pathname = usePathname();
  const breadcrumbs = React.useMemo(() => getBreadcrumbs(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between gap-4 border-b border-border/80 glass-surface px-3 md:px-6">
      {/* 1. Left: Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <SidebarTrigger
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle navigation sidebar"
        />
        <Separator orientation="vertical" className="hidden sm:block h-4" />

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.label}-${crumb.href}`}>
                  {idx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage className="truncate max-w-[140px] md:max-w-none text-xs">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href} className="text-xs">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* 2. Center: Command Search Bar */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <CommandMenu />
      </div>

      {/* 3. Right: Operations Controls */}
      <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
        <IstClock />
        <NotificationPopover />
        <ThemeToggle />

        {/* Compact User Avatar on small screens */}
        <Link
          href="/settings"
          className="md:hidden flex items-center p-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Go to office profile and settings for ${actor.name}`}
        >
          <Avatar className="size-7 rounded-full border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
              {actor.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
