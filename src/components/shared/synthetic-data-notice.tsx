import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Synthetic-data disclosure banner (SRS rule 20: development and staging use
 * synthetic data only). Rendered once in the office layout so every screen
 * carries the same honest notice instead of only the dashboard.
 *
 * Server component — no client boundary, no data.
 */
export function SyntheticDataNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-warning/20 bg-warning-container/30 px-3 py-1.5 text-[0.6875rem] text-on-warning-container",
        className,
      )}
    >
      <FlaskConical
        className="size-3.5 shrink-0 text-warning"
        aria-hidden="true"
      />
      <span className="font-medium">Demonstration mode</span>
      <span aria-hidden="true" className="text-warning/40">
        ·
      </span>
      <span className="text-on-warning-container/80">
        Volunteer records, attendance, rosters and audit entries are synthetic
        fixtures. No production or personal data is stored.
      </span>
      <span className="ml-auto hidden text-[0.5625rem] font-medium tracking-[0.08em] uppercase opacity-70 sm:inline">
        Synthetic sandbox
      </span>
    </div>
  );
}
