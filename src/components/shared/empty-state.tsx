import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-surface-container-low/70 text-muted-foreground">
        <Icon className="size-[1.15rem] shrink-0" aria-hidden="true" />
      </div>
      <h3 className="text-[0.875rem] font-medium tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-[0.75rem] leading-relaxed text-balance text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  );
}
