import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Camera, Video, Palette, PenTool, ArrowRight } from "lucide-react";
import type { DomainSummary } from "@/types/project";
import { DOMAIN_LABELS } from "@/types/project";

interface DomainRosterSectionProps {
  domains: DomainSummary[];
}

const DOMAIN_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  PHOTOGRAPHY: Camera,
  VIDEO_EDITING: Video,
  GRAPHIC_DESIGNING: Palette,
  CONTENT_WRITING: PenTool,
};

export function DomainRosterSection({ domains }: DomainRosterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <p className="max-w-2xl text-[0.75rem] leading-relaxed text-muted-foreground">
          Four creative specialisations supply media coverage, design assets,
          and written content across all nine projects. Domain membership is
          additive to a volunteer&apos;s project wing.
        </p>
        <Link
          href="/volunteers"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "shrink-0 gap-1 self-start text-muted-foreground hover:text-foreground sm:self-auto",
          })}
        >
          All specialists
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {domains.map((dom) => {
          const Icon = DOMAIN_ICONS[dom.domain] || Palette;
          const leadName = dom.leads[0]?.name ?? "Designated lead";

          return (
            <div
              key={dom.domain}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[var(--elevation-1)] transition-[box-shadow,border-color] duration-300 hover:border-border hover:shadow-[var(--elevation-2)]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-surface-container-low/60 text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <Badge
                    variant="outline"
                    className="h-4 rounded px-1.5 font-mono text-[0.5625rem]"
                  >
                    {dom.activeCount} members
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[0.8125rem] font-medium text-foreground">
                    {DOMAIN_LABELS[dom.domain] ?? dom.domain}
                  </h3>
                  <p className="line-clamp-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    {dom.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-[0.625rem] text-muted-foreground">
                <span className="max-w-[9rem] truncate">
                  Lead:{" "}
                  <span className="font-medium text-foreground/90">
                    {leadName}
                  </span>
                </span>
                <Link
                  href={`/volunteers?domain=${dom.domain}`}
                  className="shrink-0 font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Roster
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
