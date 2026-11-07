import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  /** Percent change, e.g. 12.5 or -4.2 */
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  changePeriod?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Retained for backwards compatibility; the new card uses a neutral chip. */
  iconColor?: string;
  badgeText?: string;
  /** Optional progress value (0–100) rendered as a thin rule under the value. */
  progress?: number;
  progressLabel?: string;
  /** Draws a faint accent rule along the top edge. Use sparingly. */
  accent?: boolean;
}

/**
 * Editorial metric card: label, number, quiet delta, optional progress rule.
 * The icon is a whisper, not the focal point — the number is the story.
 */
export function StatCard({
  title,
  value,
  change,
  changeType,
  changePeriod = "vs last month",
  description,
  icon: Icon,
  badgeText,
  progress,
  progressLabel,
  accent = false,
  className,
  ...props
}: StatCardProps) {
  const trend =
    changeType ||
    (typeof change === "number"
      ? change > 0
        ? "increase"
        : change < 0
          ? "decrease"
          : "neutral"
      : undefined);

  return (
    <div
      data-slot="stat-card"
      className={cn(
        "group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[var(--elevation-1)] backdrop-blur-[2px]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-quart)]",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--elevation-2)]",
        className,
      )}
      {...props}
    >
      {accent ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-label-sm font-medium tracking-[0.045em] text-muted-foreground uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="tnum text-[1.7rem] leading-none font-semibold tracking-[-0.02em] text-foreground">
              {value}
            </span>
            {badgeText ? (
              <span className="rounded-md bg-surface-container-low px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                {badgeText}
              </span>
            ) : null}
          </div>
        </div>

        {Icon ? (
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface-container-low/70 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>

      {typeof progress === "number" ? (
        <div className="space-y-1.5">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={progressLabel ?? title}
            className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high"
          >
            <div
              className="h-full origin-left rounded-full bg-primary/80"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {progressLabel ? (
            <p className="text-[0.6875rem] text-muted-foreground">{progressLabel}</p>
          ) : null}
        </div>
      ) : null}

      {(typeof change === "number" || description) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-muted-foreground">
          {typeof change === "number" ? (
            <span
              className={cn(
                "tnum inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                trend === "increase" && "bg-success-container text-on-success-container",
                trend === "decrease" && "bg-error-container text-on-error-container",
                trend === "neutral" && "bg-surface-container-low text-muted-foreground",
              )}
            >
              {trend === "increase" ? <TrendingUp className="size-3" /> : null}
              {trend === "decrease" ? <TrendingDown className="size-3" /> : null}
              {trend === "neutral" ? <Minus className="size-3" /> : null}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          ) : null}
          {description ? (
            <span className="truncate">{description}</span>
          ) : typeof change === "number" && changePeriod ? (
            <span className="text-muted-foreground/80">{changePeriod}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
