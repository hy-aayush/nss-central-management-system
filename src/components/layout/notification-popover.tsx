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

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg">
        <div className="flex items-center justify-between p-3 pb-2 border-b">
          <div className="flex items-center gap-1.5">
            <span className="text-label-md font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={markAllRead}
              className="text-[11px] text-muted-foreground hover:text-foreground h-6 px-1.5"
            >
              <CheckCheck className="size-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer text-left ${
                !notif.read ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="text-xs font-medium leading-snug text-foreground flex-1">
                  {notif.title}
                </span>
                {!notif.read && (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary mt-1" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{notif.time}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <div className="p-2 border-t text-center bg-surface-container-low">
          <span className="text-[11px] text-muted-foreground">
            Immutable application notifications
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
