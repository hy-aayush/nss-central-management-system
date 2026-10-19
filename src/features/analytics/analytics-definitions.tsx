"use client";

import { useState } from "react";
import { Info, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnalyticsDefinitions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-border bg-card/60 backdrop-blur-xs p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <h4 className="text-label-sm font-semibold text-foreground">
              Metric Formulations &amp; Calculation Standards
            </h4>
            <p className="text-label-xs text-muted-foreground">
              Institutional criteria per SRS Section 7 &amp; Academic Year 2026-27 policy.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2.5 text-label-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Hide Formulations" : "Inspect Definitions"}</span>
          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-body-sm animate-in fade-in-50 duration-200">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>Turnout Rate (%)</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              Ratio of verified <code>PRESENT</code> attendances divided by total enrolled roster slots across completed events. Excused absences do not penalize the volunteer.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>Approved Service Hours</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              Sum of allocated event hours verified by Coordinator or Tech Team. Unapproved hours remain pending and are tracked separately in the ledger.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>Active Volunteer Status</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              Volunteers with active academic standing and zero active suspension orders. Requires participation in at least one drive every 60 days.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>FCFS Reliability Index</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              Percentage of claimed FCFS slots where the volunteer was present. 3 missed slots trigger an automated 30-day registration lockout (SRS §8.3).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>Domain Engagement</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              Volunteer participation in specialized creative wings (Photography, Video, Design, Writing). Tracked independently of project wing membership.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
              <Info className="size-3 shrink-0" />
              <span>Timezone Standard (IST)</span>
            </div>
            <p className="text-label-xs text-muted-foreground leading-relaxed">
              All dates, academic quarters, and lock boundaries are evaluated in <code>Asia/Kolkata</code> (UTC+05:30) with no daylight saving shifts.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
