"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  ShieldAlert,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="border-r border-border bg-surface-container-lowest text-foreground transition-all duration-200 ease-in-out"
    >
      {/* 1. Header with Brand & Collapse Trigger */}
      <SidebarHeader className="border-b border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* NSS Logo Emblem */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
              NSS
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="truncate text-headline-sm font-semibold tracking-tight text-foreground leading-tight">
                  NSS Central
                </span>
                <span className="truncate text-[11px] text-muted-foreground font-normal leading-tight">
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
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        {/* Operational Workspace Status Strip */}
        {!isCollapsed && (
          <div className="mt-2 flex items-center justify-between rounded-md bg-surface-container-low px-2 py-1 text-label-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <span className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
              <span className="truncate">Internal Workspace</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/80">v1.0</span>
          </div>
        )}
      </SidebarHeader>

      {/* 2. Main Navigation List */}
      <SidebarContent className="px-2 py-3 space-y-1 overflow-y-auto">
        <SidebarMenu>
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  tooltip={item.title}
                  className={`relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-label-md transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-surface-container hover:text-foreground"
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.title}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <Badge
                      variant={item.badgeVariant ?? "secondary"}
                      className="ml-auto text-[10px] h-4 px-1.5 font-normal shrink-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* 3. Footer with User Profile Placeholder */}
      <SidebarFooter className="border-t border-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full data-[state=open]:bg-surface-container flex items-center gap-2.5 p-1.5 rounded-lg text-left"
                    aria-label="User account and office options"
                  />
                }
              >
                <div className="relative shrink-0">
                  <Avatar className="size-8 rounded-lg border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {actor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-success ring-2 ring-surface-container-lowest" />
                </div>

                {!isCollapsed && (
                  <div className="grid flex-1 text-left leading-tight truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-xs text-foreground">
                        {actor.name}
                      </span>
                      <Badge variant="accent" className="max-w-24 truncate text-[9px] h-3.5 px-1 py-0 uppercase">
                        {actor.roleLabel}
                      </Badge>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {actor.email}
                    </span>
                  </div>
                )}

                {!isCollapsed && <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 rounded-lg p-1 shadow-md"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-semibold leading-none text-foreground">
                          {actor.name}
                        </p>
                        <Badge variant="accent" className="max-w-28 truncate text-[9px]">
                          {actor.roleLabel}
                        </Badge>
                      </div>
                      <p className="truncate text-[11px] leading-none text-muted-foreground">
                        {actor.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <User className="size-4 text-muted-foreground" />
                  <span>Office Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/team")}
                >
                  <ShieldAlert className="size-4 text-muted-foreground" />
                  <span>Permissions &amp; Roster</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Workspace Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Expand trigger when collapsed on desktop */}
        {!isMobile && isCollapsed && (
          <div className="pt-1 flex justify-center">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground size-7"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>

      {/* Resize / rail guide */}
      <SidebarRail />
    </Sidebar>
  );
}
