"use client";

import * as React from "react";

function formatISTTime(): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "10:42 AM";
  }
}

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 30000);
  return () => clearInterval(interval);
}

export function IstClock() {
  const time = React.useSyncExternalStore(
    subscribeToClock,
    () => formatISTTime(),
    () => null
  );

  return (
    <div
      className="hidden lg:flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-label-sm text-muted-foreground border border-border/40 select-none"
      title="Standard Institute Operation Timezone (IST)"
    >
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      <span className="truncate">Asia/Kolkata (IST) {time ?? ""}</span>
    </div>
  );
}
