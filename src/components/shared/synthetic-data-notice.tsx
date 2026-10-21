import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Demonstration Mode:</strong> All
          volunteer data, attendance figures, project rosters, and audit entries
          are synthetic test fixtures. No production records or student personal
          data are stored.
        </span>
      </div>
      <Badge
        variant="outline"
        className="border-amber-500/40 text-[10px] uppercase tracking-wider shrink-0 bg-amber-500/15"
      >
        Synthetic Sandbox
      </Badge>
    </div>
  );
}
