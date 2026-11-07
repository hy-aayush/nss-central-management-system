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
    () => null,
  );

  return (
    <div
      className="hidden select-none items-center gap-1.5 rounded-full border border-border/50 bg-surface-container-low/60 px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground lg:flex"
      title="Standard Institute Operation Timezone (IST)"
    >
      <span className="size-1.5 rounded-full bg-success/90" />
      <span className="tnum truncate">
        {time ?? "—"} <span className="text-muted-foreground/60">IST</span>
      </span>
    </div>
  );
}
