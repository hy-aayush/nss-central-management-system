"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CalendarDays,
  Clock,
  Globe2,
  Hammer,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_NAMES } from "@/types/project";
import { meetingSchema, type MeetingFormValues } from "./meeting-schemas";

const AUDIENCE_HINT: Record<MeetingFormValues["type"], string> = {
  CENTRAL: "Every ACTIVE volunteer is in the audience.",
  PROJECT: "Only ACTIVE volunteers of the chosen project are in the audience.",
  BUILDERS:
    "Only active Builders and Project Representatives are in the audience.",
};

export function MeetingForm() {
  const router = useRouter();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      type: "CENTRAL",
      project: "",
      agenda: "",
      date: "2026-11-14",
      startTime: "17:30",
      endTime: "18:30",
      venue: "",
      startNow: false,
    },
  });

  const type = useWatch({ control: form.control, name: "type" });

  const submit = (values: MeetingFormValues) => {
    const label =
      values.type === "PROJECT"
        ? `${values.project} project meeting`
        : values.type === "CENTRAL"
          ? "Central meeting"
          : "Builders meeting";

    toast.success("Meeting scheduled", {
      description: `${label} on ${values.date} at ${values.startTime}. ${
        values.startNow
          ? "It starts immediately, so attendance is already open."
          : "Attendance opens when the meeting starts."
      }`,
    });

    form.reset();
    router.push("/meetings");
  };

  return (
    <Card className="border-border bg-card p-6 shadow-xs">
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-label-sm font-medium">
              Meeting type <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (!value) return;
                    field.onChange(value);
                    if (value !== "PROJECT") form.setValue("project", "");
                  }}
                >
                  <SelectTrigger className="w-full border-border bg-background">
                    <SelectValue placeholder="Choose a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CENTRAL">
                      <Globe2 className="size-3.5" /> Central
                    </SelectItem>
                    <SelectItem value="PROJECT">
                      <Building2 className="size-3.5" /> Project
                    </SelectItem>
                    <SelectItem value="BUILDERS">
                      <Hammer className="size-3.5" /> Builders
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-[11px] text-muted-foreground">
              {AUDIENCE_HINT[type]}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-label-sm font-medium">
              Project{" "}
              {type === "PROJECT" && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Controller
              name="project"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value || "NONE"}
                  onValueChange={(value) =>
                    field.onChange(value === "NONE" ? "" : value)
                  }
                  disabled={type !== "PROJECT"}
                >
                  <SelectTrigger className="w-full border-border bg-background">
                    <SelectValue placeholder="Not a project meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Not applicable</SelectItem>
                    {PROJECT_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.project && (
              <p className="text-label-xs font-medium text-destructive">
                {form.formState.errors.project.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agenda" className="text-label-sm font-medium">
            Agenda <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="agenda"
            rows={3}
            placeholder="What is this meeting deciding? Three characters minimum, 500 maximum."
            {...form.register("agenda")}
            className="border-border bg-background"
          />
          {form.formState.errors.agenda && (
            <p className="text-label-xs font-medium text-destructive">
              {form.formState.errors.agenda.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-label-sm font-medium">
              Day (IST) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                className="border-border bg-background pl-8.5"
              />
            </div>
            {form.formState.errors.date && (
              <p className="text-label-xs font-medium text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startTime" className="text-label-sm font-medium">
              Starts <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="startTime"
                type="time"
                {...form.register("startTime")}
                className="border-border bg-background pl-8.5"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endTime" className="text-label-sm font-medium">
              Ends
            </Label>
            <div className="relative">
              <Clock className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="endTime"
                type="time"
                {...form.register("endTime")}
                className="border-border bg-background pl-8.5"
              />
            </div>
            {form.formState.errors.endTime && (
              <p className="text-label-xs font-medium text-destructive">
                {form.formState.errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="venue" className="text-label-sm font-medium">
            Venue <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="venue"
              placeholder="Room, building, or an online link"
              {...form.register("venue")}
              className="border-border bg-background pl-8.5"
            />
          </div>
          {form.formState.errors.venue && (
            <p className="text-label-xs font-medium text-destructive">
              {form.formState.errors.venue.message}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/70 bg-surface-container-low/40 p-3">
          <input
            type="checkbox"
            {...form.register("startNow")}
            className="mt-0.5 size-3.5 rounded border-input text-primary"
          />
          <span className="space-y-0.5">
            <span className="block text-label-sm font-medium text-foreground">
              Start this meeting now
            </span>
            <span className="block text-[11px] text-muted-foreground">
              The status becomes ongoing immediately and roll call opens.
              Otherwise it stays scheduled until someone starts it.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
          <p className="text-[11px] text-muted-foreground">
            Attendance locks at midnight IST after the meeting day. Minutes can
            be written only once the meeting is completed.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/meetings")}
              className="text-label-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-label-sm">
              Schedule meeting
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
