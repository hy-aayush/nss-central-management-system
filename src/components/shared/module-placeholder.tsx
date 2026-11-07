import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass";
import { Badge } from "@/components/ui/badge";

export interface ModulePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Honest note about what is not implemented yet. */
  note: string;
  /** Planned capabilities, shown as a quiet list. */
  capabilities: string[];
}

/**
 * Honest placeholder for a route whose backend is not implemented yet.
 * It states the intent, lists the planned controls, and says plainly that they
 * are unavailable — it never fakes interactive functionality (SRS rule 20).
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  note,
  capabilities,
}: ModulePlaceholderProps) {
  return (
    <GlassPanel tone="panel" className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-surface-container-low/70 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-headline-md text-foreground">{title}</h2>
              <Badge
                variant="outline"
                className="h-5 rounded px-1.5 text-[0.5625rem] font-medium tracking-[0.06em] text-muted-foreground uppercase"
              >
                Not yet implemented
              </Badge>
            </div>
            <p className="max-w-2xl text-body-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <li
                key={capability}
                className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.4rem] size-1 shrink-0 rounded-full bg-border-strong"
                />
                {capability}
              </li>
            ))}
          </ul>

          <p className="border-t border-border/60 pt-3 text-[0.6875rem] leading-relaxed text-muted-foreground/80">
            {note}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
