"use client";

import * as React from "react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: "warning" | "info" | "success";
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Attendance correction pending approval: Project Aarogya Blood Drive",
    time: "12m ago",
    type: "warning",
    read: false,
  },
  {
    id: "notif-2",
    title: "Central event 'Mega Tree Plantation 2026' published to calendar",
    time: "1h ago",
    type: "info",
    read: false,
  },
  {
    id: "notif-3",
    title: "Weekly automated volunteer attendance snapshot archived",
    time: "3h ago",
    type: "success",
    read: true,
  },
];

export function NotificationPopover() {
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
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
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.8125rem] font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="h-[1.05rem] rounded px-1.5 text-[0.625rem] text-primary"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={markAllRead}
              className="h-6 gap-1 px-1.5 text-[0.6875rem] text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-72 divide-y divide-border/50 overflow-y-auto">
          {notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className={`flex cursor-pointer flex-col items-start gap-1.5 p-3 text-left transition-colors ${
                !notif.read ? "bg-primary/[0.035]" : ""
              }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="flex-1 text-[0.75rem] leading-snug font-medium text-foreground">
                  {notif.title}
                </span>
                {!notif.read && (
                  <span
                    aria-label="Unread"
                    className="mt-1 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                )}
              </div>
              <div className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                <Clock className="size-3" />
                <span>{notif.time}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <div className="border-t border-border/60 bg-surface-container-low/50 px-3 py-2 text-center">
          <span className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">
            Immutable application notifications
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
