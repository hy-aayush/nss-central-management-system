import { Skeleton } from "@/components/ui/skeleton";

/**
 * Per-route skeletons.
 *
 * A skeleton only removes perceived latency if the real content lands in the
 * same boxes the skeleton occupied. These mirror the actual page rhythm of the
 * list routes (eyebrow, title, description, actions, metric strip, toolbar,
 * bordered rows) rather than showing a generic spinner.
 */

function HeaderBlock({ actions = 1 }: { actions?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-3.5 w-[32rem] max-w-full" />
      {actions > 0 ? (
        <div className="flex gap-2 pt-1">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-lg" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MetricCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function Toolbar({ filters = 4 }: { filters?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card/75 p-4">
      <Skeleton className="h-9 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3 sm:grid-cols-4">
        {Array.from({ length: filters }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-md" />
        ))}
      </div>
    </div>
  );
}

function Rows({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-center gap-4 border-b border-border/60 bg-surface-container-low/60 px-4 py-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={i === 0 ? "h-2.5 w-24" : "h-2.5 w-16"}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-border/40 px-4 py-3.5 last:border-b-0"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          {Array.from({ length: columns - 1 }).map((_, c) => (
            <Skeleton
              key={c}
              className={c === columns - 2 ? "ml-auto h-3 w-14" : "h-3 w-20"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListRouteSkeleton({
  label,
  filters = 4,
  rows = 8,
  columns = 6,
}: {
  label: string;
  filters?: number;
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <HeaderBlock actions={2} />
      <MetricCards />
      <Toolbar filters={filters} />
      <Rows rows={rows} columns={columns} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Fallback for a single streamed panel: no header, so the real header above it
 * is already on screen and the skeleton lands in the exact box the table will
 * occupy.
 */
export function PanelSkeleton({
  label,
  filters = 3,
  rows = 8,
  columns = 5,
}: {
  label: string;
  filters?: number;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label={label}>
      <Toolbar filters={filters} />
      <Rows rows={rows} columns={columns} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function DetailRouteSkeleton({
  label,
  cards = 3,
}: {
  label: string;
  cards?: number;
}) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <Skeleton className="h-7 w-24 rounded-lg" />

      {/* Hero: identity block beside the action cluster. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-64 max-w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <MetricCards count={cards} />

      {/* Tab strip then the first panel. */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-lg" />
          ))}
        </div>
        <Rows rows={6} columns={4} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function AnalyticsRouteSkeleton({ label }: { label: string }) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <HeaderBlock actions={1} />
      <MetricCards count={4} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl lg:col-span-7" />
        <Skeleton className="h-72 rounded-2xl lg:col-span-5" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
