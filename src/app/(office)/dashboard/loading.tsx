import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      className="space-y-7"
      aria-busy="true"
      aria-label="Loading dashboard"
      role="status"
    >
      {/* Hero */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-3.5 w-[26rem] max-w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-xl lg:w-64" />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl lg:col-span-5" />
        <Skeleton className="h-72 rounded-2xl lg:col-span-7" />
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>

      <span className="sr-only">Loading dashboard</span>
    </div>
  );
}
