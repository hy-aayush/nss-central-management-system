"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Shared fallback for a single office section.
 *
 * Section boundaries keep a failed panel inside its own route: the shell, the
 * navigation and the rest of the application stay usable, and the retry
 * re-renders only this segment instead of reloading the whole page.
 */
export function SectionError({
  error,
  reset,
  section,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  section: string;
}) {
  React.useEffect(() => {
    console.error(`${section} section error:`, error);
  }, [error, section]);

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-border/70 bg-card p-6 shadow-[var(--elevation-1)]"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-warning-container/60 text-warning">
        <AlertTriangle className="size-4.5" />
      </span>

      <div className="space-y-1">
        <h2 className="text-title-sm text-foreground">
          This section could not load
        </h2>
        <p className="max-w-prose text-body-sm text-muted-foreground">
          The rest of the workspace is unaffected. Try the section again, or go
          back to a screen you know is healthy.
        </p>
        {error.digest ? (
          <p className="text-label-xs font-mono text-muted-foreground/80">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" onClick={() => reset()} className="gap-1.5">
          <RotateCcw className="size-3.5" />
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
