import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Camera, Video, Palette, PenTool, ArrowRight } from "lucide-react";
import type { DomainSummary } from "@/types/project";
import { DOMAIN_LABELS } from "@/types/project";

interface DomainRosterSectionProps {
  domains: DomainSummary[];
}

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PHOTOGRAPHY: Camera,
  VIDEO_EDITING: Video,
  GRAPHIC_DESIGNING: Palette,
  CONTENT_WRITING: PenTool,
};

export function DomainRosterSection({ domains }: DomainRosterSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Creative Domain Wings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            4 specialized creative domains providing media coverage, design assets, and content across all 9 projects
          </p>
        </div>
        <Link
          href="/volunteers"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground",
          })}
        >
          View All Specialists
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {domains.map((dom) => {
          const Icon = DOMAIN_ICONS[dom.domain] || Palette;
          const leadName = dom.leads[0]?.name ?? "Designated Lead";

          return (
            <Card
              key={dom.domain}
              className="border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {dom.activeCount} Members
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold text-foreground pt-2">
                  {DOMAIN_LABELS[dom.domain] ?? dom.domain}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {dom.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 border-t border-border/40 mt-3 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[140px]">
                  Lead: <strong className="text-foreground">{leadName}</strong>
                </span>
                <Link
                  href={`/volunteers?domain=${dom.domain}`}
                  className="text-primary hover:underline font-medium text-[11px]"
                >
                  Roster &rarr;
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
