"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Menu,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const PRIMARY_MOBILE_ITEMS = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Volunteers",
    href: "/volunteers",
    icon: Users,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: UserCheck,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 glass-surface pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-2 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    >
      <ul className="flex items-center justify-around">
        {PRIMARY_MOBILE_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-md text-[11px] transition-colors ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className={`size-5 ${isActive ? "text-primary stroke-[2.2]" : "text-muted-foreground"}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="mt-1 leading-tight tracking-tight">{item.title}</span>
              </Link>
            </li>
          );
        })}

        {/* More/Menu Drawer Trigger */}
        <li className="flex-1">
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-full flex flex-col items-center justify-center min-h-[48px] py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open full office navigation menu"
          >
            <Menu className="size-5" />
            <span className="mt-1 leading-tight tracking-tight">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
