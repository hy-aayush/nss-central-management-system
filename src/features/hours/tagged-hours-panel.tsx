"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, Plus, Search, Users } from "lucide-react";
import { notify } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDateIST } from "@/lib/time";
import type { AdjustmentType, HoursAdjustment } from "@/types/hours";
import {
  hoursAdjustmentSchema,
  type HoursAdjustmentValues,
} from "./hours-schemas";

export interface HoursVolunteerOption {
  rollNumber: string;
  name: string;
  project: string | null;
}

export interface HoursEventOption {
  id: number;
  title: string;
}

interface TaggedHoursPanelProps {
  initialAdjustments: HoursAdjustment[];
  tags: AdjustmentType[];
  volunteers: HoursVolunteerOption[];
  events: HoursEventOption[];
  years: number[];
  academicYear: number;
}

export function TaggedHoursPanel({
  initialAdjustments,
  tags,
  volunteers,
  events,
  years,
  academicYear,
}: TaggedHoursPanelProps) {
  const [adjustments, setAdjustments] =
    useState<HoursAdjustment[]>(initialAdjustments);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState(String(academicYear));
  const [open, setOpen] = useState(false);
  const [selectedRolls, setSelectedRolls] = useState<string[]>([]);
  const [volunteerSearch, setVolunteerSearch] = useState("");

  const activeTags = tags.filter((tag) => tag.isActive);

  const form = useForm<HoursAdjustmentValues>({
    resolver: zodResolver(hoursAdjustmentSchema),
    defaultValues: {
      rollNumbers: [],
      typeId: activeTags[0]?.id ?? 1,
      occurredOn: "2026-11-05",
      hours: activeTags[0]?.defaultHours ?? 2,
      description: "",
      eventId: "",
    },
  });

  const values = useWatch({ control: form.control });

  const filteredVolunteers = useMemo(() => {
    if (!volunteerSearch.trim()) return volunteers;
    const query = volunteerSearch.toLowerCase().trim();
    return volunteers.filter(
      (volunteer) =>
        volunteer.name.toLowerCase().includes(query) ||
        volunteer.rollNumber.includes(query),
    );
  }, [volunteers, volunteerSearch]);

  /** Mirrors hours_adj_once_uq: person + tag + day + event. */
  const duplicateRolls = useMemo(() => {
    const eventId = values.eventId ? Number(values.eventId) : 0;
    const duplicates = new Set<string>();
    for (const roll of selectedRolls) {
      const exists = adjustments.some(
        (adjustment) =>
          adjustment.rollNumber === roll &&
          adjustment.typeId === Number(values.typeId) &&
          adjustment.occurredOn === values.occurredOn &&
          (adjustment.eventId ?? 0) === eventId,
      );
      if (exists) duplicates.add(roll);
    }
    return duplicates;
  }, [
    adjustments,
    selectedRolls,
    values.typeId,
    values.occurredOn,
    values.eventId,
  ]);

  const filteredAdjustments = useMemo(() => {
    let list = [...adjustments];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter((adjustment) => {
        const volunteer = volunteers.find(
          (option) => option.rollNumber === adjustment.rollNumber,
        );
        return (
          adjustment.rollNumber.includes(query) ||
          (volunteer?.name.toLowerCase().includes(query) ?? false) ||
          adjustment.description.toLowerCase().includes(query)
        );
      });
    }
    if (typeFilter !== "ALL") {
      list = list.filter(
        (adjustment) => adjustment.typeId === Number(typeFilter),
      );
    }
    if (yearFilter !== "ALL") {
      list = list.filter(
        (adjustment) => adjustment.academicYear === Number(yearFilter),
      );
    }

    return list.sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));
  }, [adjustments, search, typeFilter, yearFilter, volunteers]);

  const netHours = filteredAdjustments.reduce(
    (sum, adjustment) => sum + adjustment.hours,
    0,
  );

  const openDialog = () => {
    setSelectedRolls([]);
    setVolunteerSearch("");
    form.reset({
      rollNumbers: [],
      typeId: activeTags[0]?.id ?? 1,
      occurredOn: "2026-11-05",
      hours: activeTags[0]?.defaultHours ?? 2,
      description: "",
      eventId: "",
    });
    setOpen(true);
  };

  const toggleVolunteer = (rollNumber: string) => {
    const next = selectedRolls.includes(rollNumber)
      ? selectedRolls.filter((roll) => roll !== rollNumber)
      : [...selectedRolls, rollNumber];
    setSelectedRolls(next);
    form.setValue("rollNumbers", next, { shouldValidate: true });
  };

  const submit = (formValues: HoursAdjustmentValues) => {
    const tag = tags.find((item) => item.id === Number(formValues.typeId));
    if (!tag) return;

    const eventId = formValues.eventId ? Number(formValues.eventId) : null;
    const duplicates = selectedRolls.filter((roll) =>
      adjustments.some(
        (adjustment) =>
          adjustment.rollNumber === roll &&
          adjustment.typeId === tag.id &&
          adjustment.occurredOn === formValues.occurredOn &&
          (adjustment.eventId ?? 0) === (eventId ?? 0),
      ),
    );
    const accepted = selectedRolls.filter((roll) => !duplicates.includes(roll));

    let nextId = Math.max(...adjustments.map((adjustment) => adjustment.id), 0);
    const now = new Date().toISOString();
    const created: HoursAdjustment[] = accepted.map((roll) => {
      nextId += 1;
      const month = Number(formValues.occurredOn.slice(5, 7));
      const year = Number(formValues.occurredOn.slice(0, 4));

      return {
        id: nextId,
        rollNumber: roll,
        typeId: tag.id,
        typeName: tag.name,
        occurredOn: formValues.occurredOn,
        academicYear: month >= 7 ? year : year - 1,
        hours: formValues.hours,
        description: formValues.description,
        eventId,
        createdBy: "2105404",
        createdAt: now,
      };
    });

    setAdjustments((current) => [...created, ...current]);
    setOpen(false);

    if (created.length === 0) {
      notify("warning", "Nothing added", {
        description:
          "Every selected volunteer already has this tag for that day and event.",
      });
      return;
    }

    notify(
      "success",
      `${created.length} adjustment${created.length === 1 ? "" : "s"} added`,
      {
        description:
          duplicates.length > 0
            ? `${duplicates.length} skipped — already added for that day.`
            : "Included in the next recompute for this academic year.",
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-headline-sm flex items-center gap-2 text-foreground">
              <Clock className="size-4 text-primary" />
              Tagged hours
            </h2>
            <p className="mt-0.5 max-w-2xl text-body-sm text-muted-foreground">
              Hours that do not come from an event: photography, design, a
              position held. The tag supplies the default so every volunteer is
              treated the same.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openDialog}
            className="h-8 shrink-0 text-label-xs"
          >
            <Plus className="mr-1.5 size-3.5" />
            Add hours
          </Button>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by volunteer, roll number or description…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 border-border bg-background pl-9 text-body-sm"
              aria-label="Search tagged hours"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) => value && setTypeFilter(value)}
          >
            <SelectTrigger className="h-9 w-[220px] border-border bg-background text-label-sm">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={yearFilter}
            onValueChange={(value) => value && setYearFilter(value)}
          >
            <SelectTrigger className="h-9 w-[150px] border-border bg-background text-label-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}–{String(year + 1).slice(-2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[22%]">Volunteer</TableHead>
                <TableHead className="w-[24%]">Tag</TableHead>
                <TableHead className="w-[12%]">Date</TableHead>
                <TableHead className="w-[8%] text-right">Hours</TableHead>
                <TableHead className="w-[26%]">Description</TableHead>
                <TableHead className="w-[8%]">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No tagged hours match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdjustments.map((adjustment) => {
                  const volunteer = volunteers.find(
                    (option) => option.rollNumber === adjustment.rollNumber,
                  );
                  return (
                    <TableRow key={adjustment.id} className="hover:bg-muted/20">
                      <TableCell className="py-3">
                        <Link
                          prefetch={false}
                          href={`/volunteers/${adjustment.rollNumber}`}
                          className="block text-body-sm font-medium text-foreground hover:text-primary"
                        >
                          {volunteer?.name ?? adjustment.rollNumber}
                        </Link>
                        <span className="font-mono text-label-xs text-muted-foreground">
                          {adjustment.rollNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-label-sm text-foreground">
                          {adjustment.typeName}
                        </span>
                        {adjustment.eventId && (
                          <span className="block text-[11px] text-muted-foreground">
                            Event #{adjustment.eventId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-label-sm text-muted-foreground">
                        {formatDateIST(adjustment.occurredOn)}
                      </TableCell>
                      <TableCell className="py-3 text-right text-body-sm font-semibold text-foreground">
                        {adjustment.hours > 0 ? "+" : ""}
                        {adjustment.hours}h
                      </TableCell>
                      <TableCell className="py-3 text-label-xs text-muted-foreground">
                        {adjustment.description}
                      </TableCell>
                      <TableCell className="py-3 font-mono text-label-xs text-muted-foreground">
                        {adjustment.createdBy}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-label-sm">
          <span className="text-muted-foreground">
            {filteredAdjustments.length} adjustment
            {filteredAdjustments.length === 1 ? "" : "s"} shown
          </span>
          <span className="font-semibold text-foreground">
            Net tagged hours: {netHours > 0 ? "+" : ""}
            {netHours.toFixed(1)}h
          </span>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-headline-sm">
              Add tagged hours
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground">
              Pick up to 100 volunteers, one tag, the day, and what was done.
              Rows that would duplicate an existing entry are marked
              &quot;already added&quot;.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="adjustTag"
                  className="text-label-sm font-medium"
                >
                  Tag <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="typeId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => {
                        if (!value) return;
                        const tagId = Number(value);
                        field.onChange(tagId);
                        const tag = tags.find((item) => item.id === tagId);
                        if (tag) form.setValue("hours", tag.defaultHours);
                      }}
                    >
                      <SelectTrigger
                        id="adjustTag"
                        className="w-full border-border bg-background"
                      >
                        <SelectValue placeholder="Choose a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTags.map((tag) => (
                          <SelectItem key={tag.id} value={String(tag.id)}>
                            {tag.name} ({tag.defaultHours}h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.typeId && (
                  <p className="text-label-xs font-medium text-destructive">
                    {form.formState.errors.typeId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="adjustDate"
                  className="text-label-sm font-medium"
                >
                  Day the work happened{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="adjustDate"
                    type="date"
                    {...form.register("occurredOn")}
                    className="border-border bg-background pl-8.5"
                  />
                </div>
                {form.formState.errors.occurredOn && (
                  <p className="text-label-xs font-medium text-destructive">
                    {form.formState.errors.occurredOn.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="adjustHours"
                  className="text-label-sm font-medium"
                >
                  Hours <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adjustHours"
                  type="number"
                  step={0.5}
                  {...form.register("hours", { valueAsNumber: true })}
                  className="border-border bg-background"
                />
                {form.formState.errors.hours && (
                  <p className="text-label-xs font-medium text-destructive">
                    {form.formState.errors.hours.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="adjustEvent"
                  className="text-label-sm font-medium"
                >
                  Related event{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Controller
                  name="eventId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "NONE"}
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        id="adjustEvent"
                        className="w-full border-border bg-background"
                      >
                        <SelectValue placeholder="Not linked to an event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">
                          Not linked to an event
                        </SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="adjustDescription"
                className="text-label-sm font-medium"
              >
                What was done <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="adjustDescription"
                rows={2}
                placeholder="At least 10 characters, e.g. photographed the plantation drive for the annual report…"
                {...form.register("description")}
                className="border-border bg-background"
              />
              {form.formState.errors.description && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-label-sm font-medium">
                  Volunteers ({selectedRolls.length}/100)
                </Label>
                <div className="relative w-48">
                  <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={volunteerSearch}
                    onChange={(event) => setVolunteerSearch(event.target.value)}
                    placeholder="Find a volunteer"
                    className="h-7 border-border bg-background pl-8 text-label-xs"
                    aria-label="Find a volunteer"
                  />
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto rounded-lg border border-border">
                {filteredVolunteers.map((volunteer) => {
                  const checked = selectedRolls.includes(volunteer.rollNumber);
                  const duplicate =
                    checked && duplicateRolls.has(volunteer.rollNumber);
                  return (
                    <label
                      key={volunteer.rollNumber}
                      className="flex cursor-pointer items-center justify-between gap-2 border-b border-border/60 px-2.5 py-1.5 last:border-b-0 hover:bg-muted/30"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVolunteer(volunteer.rollNumber)}
                          className="size-3.5 shrink-0 rounded border-input text-primary"
                        />
                        <span className="truncate text-label-sm text-foreground">
                          {volunteer.name}
                          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                            {volunteer.rollNumber}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {duplicate ? (
                          <Badge
                            variant="outline"
                            className="border-warning/30 bg-warning-container/60 text-[10px] text-warning"
                          >
                            Already added for that day
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            {volunteer.project ?? "General"}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              {form.formState.errors.rollNumbers && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.rollNumbers.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-label-sm"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-label-sm">
                <Users className="mr-1.5 size-3.5" />
                Add hours
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
