import { Skeleton } from "@/components/ui/skeleton";

/**
 * Instant loading shell for every office route that does not define its own
 * `loading.tsx`.
 *
 * The block proportions are taken from `PageHeader` and the table surface it
 * usually introduces: eyebrow + title + description inside the same gutter,
 * then the filter toolbar and a bordered content card. Matching the real
 * rhythm means the swap from skeleton to page does not move anything the eye
 * is already following — the difference between a fast-feeling page and a page
 * that jumps when it loads.
 */
export default function OfficeLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      {/* Page header */}
      <div className="space-y-2.5 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-3.5 w-[34rem] max-w-full" />
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2.5 rounded-xl border border-border/60 bg-card/60 p-3.5"
          >
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Toolbar + content card */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-full max-w-xs rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
          <Skeleton className="h-9 w-full rounded-none" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border/40 px-3 py-3 last:border-0"
            >
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="ml-auto hidden h-3 w-20 sm:block" />
              <Skeleton className="hidden h-3 w-16 md:block" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading page</span>
    </div>
  );
}
