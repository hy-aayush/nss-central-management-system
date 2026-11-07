import { Skeleton } from "@/components/ui/skeleton";

/**
 * Instant loading shell for every office route that does not define its own
 * `loading.tsx`. It mirrors the page header → summary → content rhythm so a
 * navigation never flashes an empty canvas.
 */
export default function OfficeLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="space-y-2 pb-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-3.5 w-[30rem] max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-[26rem] w-full rounded-2xl" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}
