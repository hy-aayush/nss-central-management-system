"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_NOTIFICATIONS, type NotificationItem } from "./notification-data";

/**
 * Only the panel body is deferred. The trigger — a bell and an unread dot — is
 * all the shell needs on first paint; the list markup and its icons are fetched
 * the first time the menu is opened, then cached by the router.
 */
const NotificationList = dynamic(
  () => import("./notification-list").then((module) => module.NotificationList),
  { ssr: false, loading: () => null },
);

export function NotificationPopover() {
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [mounted, setMounted] = React.useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = React.useCallback(() => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true })),
    );
  }, []);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setMounted(true);
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Notifications, ${unreadCount} unread`}
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[21rem] overflow-hidden rounded-xl border-border/70 p-0 shadow-[var(--elevation-3)]"
      >
        {mounted ? (
          <NotificationList
            notifications={notifications}
            onMarkAllRead={markAllRead}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
