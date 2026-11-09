"use client";

import { CheckCheck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { NotificationItem } from "./notification-data";

/**
 * The notification panel body, split out of the topbar trigger.
 *
 * The trigger needs a badge count on every page; the list itself does not — it
 * only exists once the menu opens. Keeping it in its own module means the shell
 * ships a bell and a number, and this markup (plus its icons) arrives with the
 * menu on first open.
 */
export function NotificationList({
  notifications,
  onMarkAllRead,
}: {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <>
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
            onClick={onMarkAllRead}
            className="h-6 gap-1 px-1.5 text-[0.6875rem] text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="size-3" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-72 divide-y divide-border/50 overflow-y-auto">
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className={`flex cursor-pointer flex-col items-start gap-1.5 p-3 text-left transition-colors ${
              !notification.read ? "bg-primary/[0.035]" : ""
            }`}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="flex-1 text-[0.75rem] leading-snug font-medium text-foreground">
                {notification.title}
              </span>
              {!notification.read && (
                <span
                  aria-label="Unread"
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-primary"
                />
              )}
            </div>
            <div className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
              <Clock className="size-3" />
              <span>{notification.time}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </div>

      <div className="border-t border-border/60 bg-surface-container-low/50 px-3 py-2 text-center">
        <span className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">
          Immutable application notifications
        </span>
      </div>
    </>
  );
}
