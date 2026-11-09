"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_SECTIONS } from "@/lib/navigation";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  ShieldAlert,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Display-only identity for the signed-in office member. */
export interface SidebarActor {
  name: string;
  email: string;
  roleLabel: string;
  initials: string;
}

export function AppSidebar({ actor }: { actor: SidebarActor }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-border/70 bg-transparent text-foreground",
        // The sidebar itself is a glass panel: translucent, never white-flat.
        "[&_[data-slot=sidebar-inner]]:bg-sidebar/70 [&_[data-slot=sidebar-inner]]:backdrop-blur-2xl",
        "[&_[data-slot=sidebar-inner]]:supports-[not(backdrop-filter:blur(1px))]:bg-sidebar",
      )}
    >
      {/* Brand */}
      <SidebarHeader className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-primary text-[0.625rem] font-semibold tracking-wide text-primary-foreground shadow-[0_1px_2px_oklch(0.25_0.03_265/20%)]">
              <span className="relative z-10">NSS</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent"
              />
            </div>

            {!isCollapsed && (
              <div className="flex min-w-0 flex-col text-left leading-tight">
                <span className="truncate text-[0.8125rem] font-semibold tracking-[-0.01em] text-foreground">
                  NSS Central
                </span>
                <span className="truncate text-[0.6875rem] font-normal text-muted-foreground">
                  KIIT University Unit
                </span>
              </div>
            )}
          </Link>

          {!isMobile && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleSidebar}
              className="shrink-0 rounded-md text-muted-foreground hover:bg-surface-container-high/60 hover:text-foreground"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-3.5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="no-scrollbar px-2 pb-2">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <SidebarGroup
            key={section.title ?? sectionIndex}
            className="p-0 pt-2 first:pt-0"
          >
            {section.title ? (
              <p className="px-2.5 pb-1 text-[0.625rem] font-semibold tracking-[0.09em] text-muted-foreground/70 uppercase group-data-[collapsible=icon]:hidden">
                {section.title}
              </p>
            ) : null}

            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          prefetch={item.prefetch ?? undefined}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[0.8125rem] transition-[background-color,color] duration-200 ease-[var(--ease-out-quart)]",
                        isActive
                          ? "bg-primary/[0.075] font-medium text-primary hover:bg-primary/[0.10] hover:text-primary"
                          : "text-muted-foreground hover:bg-surface-container-high/55 hover:text-foreground",
                      )}
                    >
                      {isActive && !isCollapsed && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary"
                        />
                      )}
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground/80",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.title}
                        </span>
                      )}
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant ?? "secondary"}
                          className="ml-auto h-[1.05rem] shrink-0 rounded px-1.5 text-[0.625rem] font-medium"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Account */}
      <SidebarFooter className="border-t border-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="h-11 w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors data-[state=open]:bg-surface-container-high/60"
                    aria-label="User account and office options"
                  />
                }
              >
                <div className="relative shrink-0">
                  <Avatar className="size-8 rounded-[10px]">
                    <AvatarFallback className="bg-primary/10 text-[0.6875rem] font-semibold text-primary">
                      {actor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-success ring-2 ring-sidebar" />
                </div>

                {!isCollapsed && (
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-[0.75rem] font-semibold text-foreground">
                      {actor.name}
                    </span>
                    <span className="truncate text-[0.6875rem] text-muted-foreground">
                      {actor.roleLabel}
                    </span>
                  </div>
                )}

                {!isCollapsed && (
                  <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground/70" />
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-60 rounded-xl p-1 shadow-[var(--elevation-3)]"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[0.75rem] leading-none font-semibold text-foreground">
                          {actor.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="max-w-28 truncate rounded px-1.5 text-[0.5625rem] tracking-wide uppercase"
                        >
                          {actor.roleLabel}
                        </Badge>
                      </div>
                      <p className="truncate text-[0.6875rem] leading-none text-muted-foreground">
                        {actor.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[0.8125rem]"
                  onClick={() => router.push("/settings")}
                >
                  <User className="size-4 text-muted-foreground" />
                  <span>Office Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[0.8125rem]"
                  onClick={() => router.push("/team")}
                >
                  <ShieldAlert className="size-4 text-muted-foreground" />
                  <span>Permissions &amp; Roster</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[0.8125rem]"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Workspace Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem] text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <p className="flex items-center justify-between px-2 pt-1 text-[0.625rem] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success/80" />
              Internal workspace
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Command className="size-2.5" />K
            </span>
          </p>
        )}

        {!isMobile && isCollapsed && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleSidebar}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="size-3.5" />
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
