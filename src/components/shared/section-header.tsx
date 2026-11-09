import * as React from "react";

import { PAGE_RHYTHM } from "@/components/shared/page-rhythm";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  /** Heading level for correct document outline. Defaults to h2. */
  as?: "h2" | "h3";
}

/**
 * The single section-title pattern used across every portal module.
 * Editorial hierarchy: eyebrow (optional) → title → description → actions.
 */
export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  as: Heading = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
        <Heading className="text-headline-md text-foreground">{title}</Heading>
        {description ? (
          <p
            className={cn(
              PAGE_RHYTHM.descriptionWidth,
              "text-body-sm text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
