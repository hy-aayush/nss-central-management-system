import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  badge,
  title,
  description,
  actions,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-4 border-b border-border/60",
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1 min-w-0">
        {badge && <div className="flex items-center gap-2">{badge}</div>}
        <h1 className="text-headline-lg font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-body-sm text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
