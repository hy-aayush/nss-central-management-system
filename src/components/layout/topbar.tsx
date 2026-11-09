"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
    <header
      className={[
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-border/60 px-3 md:h-16 md:px-6",
        // Glass header: translucent, saturated, with a solid fallback.
        // The blur radius is deliberately modest — this strip is sticky, so its
        // backdrop is recomputed on every scroll frame and a 40px radius is a
        // measurable amount of GPU work for a difference nobody can see.
        "bg-background/80 backdrop-blur-md backdrop-saturate-150 scroll-seam",
        "supports-[not(backdrop-filter:blur(1px))]:bg-background",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
        <SidebarTrigger
          className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-surface-container-high/60 hover:text-foreground"
          aria-label="Toggle navigation sidebar"
        />

        <span
          aria-hidden="true"
          className="hidden h-4 w-px bg-border sm:block"
        />

        <div className="hidden min-w-0 items-center sm:flex">
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 text-[0.75rem]">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.label}-${crumb.href}`}>
                  {idx > 0 && (
                    <BreadcrumbSeparator className="text-muted-foreground/40" />
                  )}
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage className="max-w-[9rem] truncate font-medium text-foreground md:max-w-none">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
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

      <div className="mx-auto flex max-w-md flex-1 justify-center">
        <CommandMenu />
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-1.5">
        <IstClock />
        <NotificationPopover />
        <ThemeToggle />

        <Link
          href="/settings"
          className="flex items-center rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-label={`Go to office profile and settings for ${actor.name}`}
        >
          <Avatar className="size-7 rounded-full">
            <AvatarFallback className="bg-primary/10 text-[0.625rem] font-semibold text-primary">
              {actor.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
