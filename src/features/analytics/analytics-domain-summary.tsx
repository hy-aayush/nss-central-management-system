"use client";

import { Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DomainAnalyticsSummary } from "@/types/analytics";

interface AnalyticsDomainSummaryProps {
  domains: DomainAnalyticsSummary[];
}

const DOMAIN_FORMATTED: Record<string, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEO_EDITING: "Video Editing",
  GRAPHIC_DESIGNING: "Graphic Designing",
  CONTENT_WRITING: "Content Writing",
};

export function AnalyticsDomainSummary({ domains }: AnalyticsDomainSummaryProps) {
  return (
    <Card className="p-6 bg-card border-border shadow-xs space-y-4">
      <div>
        <h3 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="size-4.5 text-primary" />
          Creative Domain Specializations
        </h3>
        <p className="text-body-sm text-muted-foreground">
          Distribution and cross-domain overlap across the 4 specialized operational wings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((dom) => {
          const title = DOMAIN_FORMATTED[dom.domain] || dom.domain;
          return (
            <div
              key={dom.domain}
              className="p-4 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-label-sm text-foreground">{title}</h4>
                  <span className="text-[11px] text-muted-foreground">
                    {dom.percentageOfTotal}% of active volunteer body
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 text-label-sm">
                  <Users className="size-3.5 text-primary" />
                  {dom.memberCount} Volunteers
                </div>
              </div>

              {/* Overlap matrix */}
              <div className="space-y-1.5 bg-background/60 p-2.5 rounded-lg border border-border/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Cross-Wing Specialization Overlap:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dom.overlapWith.map((ov) => (
                    <Badge
                      key={ov.domain}
                      variant="outline"
                      className="text-[11px] font-normal bg-muted/40 border-border text-foreground"
                    >
                      {DOMAIN_FORMATTED[ov.domain] || ov.domain}: <span className="font-mono font-semibold ml-1 text-primary">{ov.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Gender ratio */}
              <div className="flex items-center justify-between text-label-xs text-muted-foreground pt-1">
                <span>Gender Ratio:</span>
                <span className="font-mono text-foreground font-medium">
                  {dom.gender.male} Male ({dom.gender.malePercent}%) • {dom.gender.female} Female ({dom.gender.femalePercent}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
