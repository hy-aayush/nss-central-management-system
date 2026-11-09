"use client";

import * as React from "react";

/**
 * One formatter for the whole client: constructing `Intl.DateTimeFormat` is
 * expensive and it was previously rebuilt on every tick. Clock ticks are also
 * aligned to the minute, so the component re-renders once a minute instead of
 * twice (a fifteen-second timer would keep waking the main thread for no
 * visible change).
 */
const IST_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatISTTime(): string {
  try {
    return IST_TIME.format(new Date());
  } catch {
    return "10:42 AM";
  }
}

/** First tick on the next minute boundary, then every minute. */
function subscribeToClock(callback: () => void) {
  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  let interval: ReturnType<typeof setInterval> | undefined;

  const start = setTimeout(() => {
    callback();
    interval = setInterval(callback, 60_000);
  }, msToNextMinute);

  return () => {
    clearTimeout(start);
    if (interval) clearInterval(interval);
  };
}

export function IstClock() {
  const time = React.useSyncExternalStore(
    subscribeToClock,
    formatISTTime,
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
