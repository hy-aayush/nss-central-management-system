import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "table" | "cards" | "detail" | "spinner";
  count?: number;
  message?: string;
}

export function LoadingState({
  variant = "table",
  count = 5,
  message = "Loading records...",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={message}
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border/60 bg-card/50 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={message}
        className={cn("space-y-6", className)}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={message}
        className={cn("flex flex-col items-center justify-center p-8 gap-3", className)}
        {...props}
      >
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  // Default: Table skeleton rows
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      className={cn("w-full space-y-3 p-4", className)}
      {...props}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-4 w-6 rounded" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
      <span className="sr-only">{message}</span>
    </div>
  );
}
