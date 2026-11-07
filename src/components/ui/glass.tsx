import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Liquid-glass surface primitives.
 *
 * Three tones exist so glass stays intentional rather than decorative:
 *  - `quiet`   — content cards sitting in the page flow (barely tinted)
 *  - `panel`   — navigation, sticky toolbars, floating dashboard widgets
 *  - `overlay` — dialogs, command menus, popovers (highest opacity)
 *
 * Every tone has a solid fallback declared in globals.css for browsers
 * without `backdrop-filter`, so contrast never depends on blur support.
 */
type GlassTone = "quiet" | "panel" | "overlay";
type GlassPadding = "none" | "sm" | "md" | "lg";

const TONE: Record<GlassTone, string> = {
  quiet: "glass-quiet",
  panel: "glass-panel",
  overlay: "glass-overlay",
};

const PADDING: Record<GlassPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: GlassTone;
  padding?: GlassPadding;
  /** Adds the subtle hover lift. Only use when the whole panel is clickable. */
  interactive?: boolean;
}

export function GlassPanel({
  tone = "quiet",
  padding = "none",
  interactive = false,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      data-slot="glass-panel"
      data-tone={tone}
      className={cn(
        "relative rounded-2xl",
        TONE[tone],
        PADDING[padding],
        interactive && "lift press cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export interface GlassCardProps
  extends React.ComponentPropsWithoutRef<"div"> {
  interactive?: boolean;
}

/**
 * A content card. Solid-leaning by design: most of the portal is reading
 * surface, and reading surfaces should not be translucent.
 */
export function GlassCard({
  interactive = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "relative rounded-2xl border border-border/70 bg-card/85 text-card-foreground shadow-[var(--elevation-1)] backdrop-blur-[2px]",
        "transition-[box-shadow,border-color,transform] duration-300 ease-[var(--ease-out-quart)]",
        interactive &&
          "hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--elevation-2)]",
        className,
      )}
      {...props}
    />
  );
}

/** Sticky filter / action bar. */
export function GlassToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="glass-toolbar"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/70 p-2 backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

/** Recessed inner surface for grouped rows and read-only values. */
export function GlassInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="glass-inset"
      className={cn(
        "rounded-lg border border-border/60 bg-surface-container-low/60",
        className,
      )}
      {...props}
    />
  );
}
