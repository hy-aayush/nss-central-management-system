"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BadgeCheck, Clock, ListChecks, Tag } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdjustmentType,
  HoursAdjustment,
  HoursApprovalRow,
  HoursRecomputeState,
  VolunteerYearHours,
} from "@/types/hours";
import type {
  HoursEventOption,
  HoursVolunteerOption,
} from "./tagged-hours-panel";
import { HoursApprovalPanel } from "./hours-approval-panel";
import { PanelFallback } from "./panel-fallback";

/**
 * Only the approval panel is part of the route's first payload.
 *
 * The other three tabs each carry a form stack (react-hook-form + zod + the
 * dialog primitives). Splitting them into their own chunks means opening
 * /hours costs the panel that is actually visible, and a tab's code is fetched
 * the first time someone opens that tab — then cached by the router for the
 * rest of the session.
 */
const TaggedHoursPanel = dynamic(
  () =>
    import("./tagged-hours-panel").then((module) => module.TaggedHoursPanel),
  { loading: () => <PanelFallback rows={2} /> },
);

const AdjustmentTagsPanel = dynamic(
  () =>
    import("./adjustment-tags-panel").then(
      (module) => module.AdjustmentTagsPanel,
    ),
  { loading: () => <PanelFallback rows={2} /> },
);

const YearRollupPanel = dynamic(
  () => import("./year-rollup-panel").then((module) => module.YearRollupPanel),
  { loading: () => <PanelFallback rows={4} /> },
);

interface HoursViewProps {
  approvalRowsByYear: Record<number, HoursApprovalRow[]>;
  recomputeByYear: Record<number, HoursRecomputeState>;
  adjustments: HoursAdjustment[];
  tags: AdjustmentType[];
  rollups: VolunteerYearHours[];
  volunteers: HoursVolunteerOption[];
  events: HoursEventOption[];
  years: number[];
  defaultYear: number;
  volunteerCount: number;
}

export function HoursView({
  approvalRowsByYear,
  recomputeByYear,
  adjustments,
  tags,
  rollups,
  volunteers,
  events,
  years,
  defaultYear,
  volunteerCount,
}: HoursViewProps) {
  const [year, setYear] = useState(defaultYear);

  return (
    <Tabs defaultValue="approval" className="w-full space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="rounded-xl border border-border bg-muted/50 p-1">
          <TabsTrigger value="approval" className="gap-1.5 text-label-sm">
            <BadgeCheck className="size-4" />
            <span>Hours approval</span>
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="gap-1.5 text-label-sm">
            <Clock className="size-4" />
            <span>Tagged hours</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-1.5 text-label-sm">
            <Tag className="size-4" />
            <span>Tags</span>
          </TabsTrigger>
          <TabsTrigger value="rollup" className="gap-1.5 text-label-sm">
            <ListChecks className="size-4" />
            <span>Yearly rollup</span>
          </TabsTrigger>
        </TabsList>

        <Select
          value={String(year)}
          onValueChange={(value) => value && setYear(Number(value))}
        >
          <SelectTrigger className="h-8 w-[190px] border-border bg-card text-label-sm">
            <SelectValue placeholder="Academic year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((option) => (
              <SelectItem key={option} value={String(option)}>
                Academic year {option}–{String(option + 1).slice(-2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TabsContent value="approval">
        <HoursApprovalPanel
          key={`approval-${year}`}
          academicYear={year}
          initialRows={approvalRowsByYear[year] ?? []}
          recompute={
            recomputeByYear[year] ?? {
              academicYear: year,
              lastRecomputedAt: null,
              volunteers: 0,
            }
          }
          volunteerCount={volunteerCount}
        />
      </TabsContent>{" "}
      <TabsContent value="adjustments">
        <TaggedHoursPanel
          initialAdjustments={adjustments}
          tags={tags}
          volunteers={volunteers}
          events={events}
          years={years}
          academicYear={year}
        />
      </TabsContent>{" "}
      <TabsContent value="tags">
        <AdjustmentTagsPanel initialTags={tags} />
      </TabsContent>{" "}
      <TabsContent value="rollup">
        <YearRollupPanel
          rollups={rollups}
          volunteers={volunteers}
          years={years}
          academicYear={year}
        />
      </TabsContent>
    </Tabs>
  );
}
