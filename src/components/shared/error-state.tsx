import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
}

export function ErrorState({
  title = "Failed to load records",
  message = "An unexpected error occurred while retrieving data. Please try again or contact the technical administrator.",
  onRetry,
  actionText = "Try again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/25 bg-error-container/30 px-6 py-9 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-[1.15rem] shrink-0" aria-hidden="true" />
      </div>
      <h3 className="text-[0.875rem] font-medium tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-[0.75rem] leading-relaxed text-balance text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-destructive/25 text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="size-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
}
