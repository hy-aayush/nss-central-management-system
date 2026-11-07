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
  message = "Loading records…",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={message}
        className={cn("grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4", className)}
        {...props}
      >
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
            <Skeleton className="h-3 w-32" />
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
        className={cn("space-y-5", className)}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="grid gap-3.5 md:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
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
        className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}
        {...props}
      >
        <div className="size-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <p className="text-[0.75rem] text-muted-foreground">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      className={cn("w-full space-y-3 p-4", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-3.5 w-6 rounded" />
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="ml-auto h-3.5 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
      <span className="sr-only">{message}</span>
    </div>
  );
}
