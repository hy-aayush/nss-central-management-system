"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricStrip } from "@/components/shared/metric-strip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTimeIST } from "@/lib/time";
import type { VolunteerYearHours } from "@/types/hours";
import type { HoursVolunteerOption } from "./tagged-hours-panel";

interface YearRollupPanelProps {
  rollups: VolunteerYearHours[];
  volunteers: HoursVolunteerOption[];
  years: number[];
  academicYear: number;
}

export function YearRollupPanel({
  rollups,
  volunteers,
  years,
  academicYear,
}: YearRollupPanelProps) {
  const [year, setYear] = useState(String(academicYear));
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let list = rollups.filter((row) => row.academicYear === Number(year));

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter((row) => {
        const volunteer = volunteers.find(
          (option) => option.rollNumber === row.rollNumber,
        );
        return (
          row.rollNumber.includes(query) ||
          (volunteer?.name.toLowerCase().includes(query) ?? false)
        );
      });
    }

    return [...list].sort((a, b) => b.total - a.total);
  }, [rollups, year, search, volunteers]);

  const totals = rows.reduce(
    (acc, row) => ({
      event: acc.event + row.eventHours,
      adjustment: acc.adjustment + row.adjustmentHours,
      legacy: acc.legacy + row.legacyHours,
      total: acc.total + row.total,
    }),
    { event: 0, adjustment: 0, legacy: 0, total: 0 },
  );

  return (
    <div className="space-y-4">
      <MetricStrip
        columns={4}
        items={[
          {
            label: "Event hours",
            value: totals.event.toFixed(1),
            hint: "approved attendance only",
          },
          {
            label: "Adjustment hours",
            value: totals.adjustment.toFixed(1),
            hint: "tagged extra work",
          },
          {
            label: "Legacy hours",
            value: totals.legacy.toFixed(1),
            hint: "imported ledger, never recomputed",
          },
          {
            label: "Total hours",
            value: totals.total.toFixed(1),
            tone: "primary",
          },
        ]}
        footer="One row per volunteer per academic year. A profile's allocated hours are the sum across years and change only inside a recompute or a history import."
      />

      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-headline-sm flex items-center gap-2 text-foreground">
              <Gauge className="size-4 text-primary" />
              Yearly rollup
            </h2>
            <p className="mt-0.5 text-body-sm text-muted-foreground">
              The stored totals volunteer pages and analytics read. Purged years
              are frozen history and cannot be recomputed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a volunteer"
                className="h-8 w-48 border-border bg-background pl-8 text-label-xs"
                aria-label="Find a volunteer in the rollup"
              />
            </div>
            <Select
              value={year}
              onValueChange={(value) => value && setYear(value)}
            >
              <SelectTrigger className="h-8 w-[150px] border-border bg-background text-label-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}–{String(option + 1).slice(-2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[30%]">Volunteer</TableHead>
                <TableHead className="w-[14%]">Project</TableHead>
                <TableHead className="w-[11%] text-right">Event</TableHead>
                <TableHead className="w-[12%] text-right">
                  Adjustments
                </TableHead>
                <TableHead className="w-[11%] text-right">Legacy</TableHead>
                <TableHead className="w-[10%] text-right">Total</TableHead>
                <TableHead className="w-[12%]">Computed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No rollup rows for {year}–
                    {String(Number(year) + 1).slice(-2)} yet. Approve hours and
                    recompute.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const volunteer = volunteers.find(
                    (option) => option.rollNumber === row.rollNumber,
                  );
                  return (
                    <TableRow
                      key={`${row.rollNumber}-${row.academicYear}`}
                      className="hover:bg-muted/20"
                    >
                      <TableCell className="py-3">
                        <Link
                          prefetch={false}
                          href={`/volunteers/${row.rollNumber}`}
                          className="block text-body-sm font-medium text-foreground hover:text-primary"
                        >
                          {volunteer?.name ?? row.rollNumber}
                        </Link>
                        <span className="font-mono text-label-xs text-muted-foreground">
                          {row.rollNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-label-sm text-muted-foreground">
                        {volunteer?.project ?? "General"}
                      </TableCell>
                      <TableCell className="py-3 text-right text-label-sm text-foreground">
                        {row.eventHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="py-3 text-right text-label-sm text-foreground">
                        {row.adjustmentHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="py-3 text-right text-label-sm text-muted-foreground">
                        {row.legacyHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="py-3 text-right text-body-sm font-semibold text-primary">
                        {row.total.toFixed(1)}h
                      </TableCell>
                      <TableCell className="py-3 text-label-xs text-muted-foreground">
                        {formatDateTimeIST(row.computedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
