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
  actionText = "Try Again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-foreground animate-fade-in",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/15 text-destructive mb-3 ring-8 ring-destructive/10">
        <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm text-balance">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-destructive/30 hover:bg-destructive/10 text-destructive"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
}
