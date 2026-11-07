import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Page-level header. One pattern for every route so the portal reads as a
 * single product: context line, title, one-sentence purpose, actions.
 */
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
        "flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-2">
        {badge ? (
          <div className="flex flex-wrap items-center gap-2">{badge}</div>
        ) : null}
        <h1 className="text-headline-lg text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-body-md leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {(actions || children) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

export interface PageEyebrowProps {
  /** Module name, e.g. "Office roster". */
  label: string;
  /** Secondary context, e.g. "NSS Central Unit". */
  meta?: React.ReactNode;
  className?: string;
}

/**
 * The small context line above every page title. Muted by design: the page
 * title should win, not the chrome around it.
 */
export function PageEyebrow({ label, meta, className }: PageEyebrowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] font-medium tracking-[0.02em]",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-primary">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-primary/80"
        />
        <span className="uppercase tracking-[0.075em]">{label}</span>
      </span>
      {meta ? (
        <>
          <span aria-hidden="true" className="text-border-strong">
            /
          </span>
          <span className="font-normal text-muted-foreground">{meta}</span>
        </>
      ) : null}
    </div>
  );
}
