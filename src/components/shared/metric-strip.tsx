import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type MetricTone =
  "default" | "primary" | "success" | "warning" | "danger";

export interface MetricItem {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: MetricTone;
}

export interface MetricStripProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MetricItem[];
  columns?: 2 | 3 | 4 | 5;
  /** Optional quiet footnote row under the metrics. */
  footer?: React.ReactNode;
}

const COLUMNS: Record<NonNullable<MetricStripProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
};

const TONE_VALUE: Record<MetricTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

/**
 * The summary strip every module shares: one surface, divided cells, tabular
 * values. Replaces the row of five individually coloured cards that made each
 * screen look like a different product.
 */
export function MetricStrip({
  items,
  columns = 4,
  footer,
  className,
  ...props
}: MetricStripProps) {
  return (
    <div
      data-slot="metric-strip"
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-[var(--elevation-1)] backdrop-blur-[2px]",
        className,
      )}
      {...props}
    >
      {/* A 1px gap over a border-coloured background draws clean dividers in
          both directions, at every breakpoint, without divide-* edge cases. */}
      <div
        className={cn("grid grid-cols-1 gap-px bg-border/55", COLUMNS[columns])}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const tone = item.tone ?? "default";
          return (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 bg-card p-4 transition-colors duration-200 ease-[var(--ease-out-quart)] hover:bg-surface-container-low/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[0.625rem] font-medium tracking-[0.075em] text-muted-foreground uppercase">
                  {item.label}
                </p>
                {Icon ? (
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-3.5 shrink-0",
                      tone === "default"
                        ? "text-muted-foreground/60"
                        : TONE_VALUE[tone],
                    )}
                  />
                ) : null}
              </div>
              <p
                className={cn(
                  "tnum text-[1.375rem] leading-none font-semibold tracking-[-0.02em]",
                  TONE_VALUE[tone],
                )}
              >
                {item.value}
              </p>
              {item.hint ? (
                <p className="text-[0.6875rem] leading-snug text-muted-foreground">
                  {item.hint}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {footer ? (
        <div className="border-t border-border/60 bg-surface-container-low/40 px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
