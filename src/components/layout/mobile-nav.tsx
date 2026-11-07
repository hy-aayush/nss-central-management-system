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
import { motion, useReducedMotion } from "motion/react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const PRIMARY_MOBILE_ITEMS = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Volunteers", href: "/volunteers", icon: Users },
  { title: "Events", href: "/events", icon: Calendar },
  { title: "Attendance", href: "/attendance", icon: UserCheck },
];

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 md:hidden",
        "rounded-2xl border border-border/70 bg-card/80 shadow-[var(--elevation-2)] backdrop-blur-2xl backdrop-saturate-150",
        "pb-[max(env(safe-area-inset-bottom),0.25rem)]",
      )}
    >
      <ul className="flex items-stretch px-1.5 pt-1.5">
        {PRIMARY_MOBILE_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[0.625rem] font-medium tracking-[0.01em]"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    className="absolute inset-0 rounded-xl bg-primary/[0.085]"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "relative size-[1.15rem] transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "relative transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[0.625rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open full office navigation menu"
          >
            <Menu className="size-[1.15rem]" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
