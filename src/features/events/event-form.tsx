"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Clock,
  MapPin,
  Building2,
  Globe2,
  Users,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EVENT_CATEGORIES,
  PROJECT_NAMES,
  centralEventSchema,
  projectEventSchema,
  type CentralEventFormValues,
  type ProjectEventFormValues,
} from "./event-schemas";

interface EventFormProps {
  mode: "CENTRAL" | "PROJECT";
}

export function EventForm({ mode }: EventFormProps) {
  return mode === "CENTRAL" ? <CentralEventForm /> : <ProjectEventForm />;
}

// ============================================================================
// Central Event Form Component
// ============================================================================
function CentralEventForm() {
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CentralEventFormValues>({
    resolver: zodResolver(centralEventSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      categoryId: 1,
      startsAt: "2026-11-15T09:00",
      endsAt: "2026-11-15T17:00",
      hours: 8,
      participation: "FCFS",
      fcfsOpensAt: "2026-11-08T18:00",
      fcfsLockAt: "2026-11-08T19:00",
      capacityTotal: 135,
      slotsBandhutva: 15,
      slotsDhara: 15,
      slotsNidaan: 15,
      slotsRiddhi: 15,
      slotsSanyukt: 15,
      slotsSparsh: 15,
      slotsSwet: 15,
      slotsUdaan: 15,
      slotsUrja: 15,
      notes: "",
    },
  });

  const { errors } = form.formState;
  const values = useWatch({ control: form.control });

  const handleReview = () => {
    form.handleSubmit(
      () => setReviewOpen(true),
      (errs) => {
        const firstKey = Object.keys(errs)[0];
        const msg = (errs as Record<string, { message?: string }>)[firstKey]?.message;
        toast.error("Form Validation Error", {
          description: msg || "Please correct the highlighted fields.",
        });
      }
    )();
  };

  const handleConfirmSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setReviewOpen(false);
      toast.success("Central Event Created (Simulated)", {
        description: "Event schema validated and reviewed. In this demo, changes are simulated without database writes.",
      });
      router.push("/events");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-body-sm">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Central Organization Event Scheduler</p>
          <p className="text-muted-foreground text-label-sm">
            Configures university-wide events in IST. All FCFS quotas must lock before start time (SRS §11.3).
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Core Information */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Globe2 className="size-4.5 text-blue-500" />
            <h3 className="text-headline-sm font-semibold text-foreground">1. Core Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="title" className="text-label-sm font-medium">
                Event Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Annual Mega Blood Donation Drive 2026"
                {...form.register("title")}
                className="bg-background border-border"
              />
              {errors.title && <p className="text-destructive text-label-xs font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-label-sm font-medium">
                Event Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(Number(val));
                      const cat = EVENT_CATEGORIES.find((c) => c.id === Number(val));
                      if (cat) form.setValue("hours", cat.defaultHours);
                    }}
                  >
                    <SelectTrigger id="categoryId" className="bg-background border-border">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name} ({cat.defaultHours}h default)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-destructive text-label-xs font-medium">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue" className="text-label-sm font-medium">
                Venue Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="venue"
                  placeholder="e.g., Campus 6 Auditorium Foyer"
                  {...form.register("venue")}
                  className="pl-9 bg-background border-border"
                />
              </div>
              {errors.venue && <p className="text-destructive text-label-xs font-medium">{errors.venue.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description" className="text-label-sm font-medium">
                Description &amp; Purpose <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Detail the target goals, external partner agencies, community beneficiaries..."
                {...form.register("description")}
                className="bg-background border-border"
              />
              {errors.description && <p className="text-destructive text-label-xs font-medium">{errors.description.message}</p>}
            </div>
          </div>
        </Card>

        {/* Schedule & Hours */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Clock className="size-4.5 text-amber-500" />
            <h3 className="text-headline-sm font-semibold text-foreground">2. Schedule &amp; Hours (IST)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" className="text-label-sm font-medium">
                Start Date &amp; Time (IST) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...form.register("startsAt")}
                className="bg-background border-border text-body-sm"
              />
              {errors.startsAt && <p className="text-destructive text-label-xs font-medium">{errors.startsAt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endsAt" className="text-label-sm font-medium">
                End Date &amp; Time (IST)
              </Label>
              <Input
                id="endsAt"
                type="datetime-local"
                {...form.register("endsAt")}
                className="bg-background border-border text-body-sm"
              />
              {errors.endsAt && <p className="text-destructive text-label-xs font-medium">{errors.endsAt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hours" className="text-label-sm font-medium">
                Allocated Service Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hours"
                type="number"
                min={0}
                max={100}
                {...form.register("hours")}
                className="bg-background border-border"
              />
              {errors.hours && <p className="text-destructive text-label-xs font-medium">{errors.hours.message}</p>}
            </div>
          </div>
        </Card>

        {/* Participation & Slots */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Users className="size-4.5 text-primary" />
            <h3 className="text-headline-sm font-semibold text-foreground">3. Participation &amp; Registration</h3>
          </div>

          <div className="space-y-3">
            <Label className="text-label-sm font-medium">Participation Mode</Label>
            <Controller
              name="participation"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      field.value === "FCFS"
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border bg-background hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.name}
                        checked={field.value === "FCFS"}
                        onChange={() => field.onChange("FCFS")}
                        className="text-primary"
                      />
                      <span className="font-semibold text-body-sm">FCFS Slot-Capped</span>
                    </div>
                    <p className="text-label-xs text-muted-foreground mt-1">
                      Project PRs register quotas from external FCFS windows.
                    </p>
                  </label>

                  <label
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      field.value === "OPEN_TO_ALL"
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border bg-background hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.name}
                        checked={field.value === "OPEN_TO_ALL"}
                        onChange={() => field.onChange("OPEN_TO_ALL")}
                        className="text-primary"
                      />
                      <span className="font-semibold text-body-sm">Open to All Volunteers</span>
                    </div>
                    <p className="text-label-xs text-muted-foreground mt-1">
                      Any active volunteer can attend. Roll call done via general lookup.
                    </p>
                  </label>
                </div>
              )}
            />
          </div>

          {values.participation === "FCFS" && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fcfsOpensAt" className="text-label-sm font-medium">
                    FCFS Opens At (IST) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fcfsOpensAt"
                    type="datetime-local"
                    {...form.register("fcfsOpensAt")}
                    className="bg-background border-border text-body-sm"
                  />
                  {errors.fcfsOpensAt && <p className="text-destructive text-label-xs font-medium">{errors.fcfsOpensAt.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fcfsLockAt" className="text-label-sm font-medium">
                    FCFS Locks At (IST) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fcfsLockAt"
                    type="datetime-local"
                    {...form.register("fcfsLockAt")}
                    className="bg-background border-border text-body-sm"
                  />
                  {errors.fcfsLockAt && <p className="text-destructive text-label-xs font-medium">{errors.fcfsLockAt.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="capacityTotal" className="text-label-sm font-medium">
                  Total Organization Capacity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="capacityTotal"
                  type="number"
                  min={10}
                  max={500}
                  {...form.register("capacityTotal")}
                  className="bg-background border-border max-w-xs"
                />
                {errors.capacityTotal && <p className="text-destructive text-label-xs font-medium">{errors.capacityTotal.message}</p>}
              </div>
            </div>
          )}
        </Card>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => router.push("/events")} className="text-label-sm">
            Cancel
          </Button>
          <Button type="button" onClick={handleReview} className="text-label-sm shadow-xs">
            Review Event Details
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </div>
      </form>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-headline-sm">
              <CheckCircle2 className="size-5 text-primary" />
              Review &amp; Schedule Central Event
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground">
              Verify event configuration before confirming. PRs and Builders are granted 2 subsequent edits after first save (SRS §11.2).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-2 text-body-sm">
            <div className="p-3.5 rounded-xl bg-muted/40 space-y-2 border border-border">
              <div>
                <span className="text-label-xs uppercase tracking-wider text-muted-foreground block">
                  Title &amp; Credit
                </span>
                <span className="font-semibold text-foreground">{values.title || "Untitled"}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-label-xs">Central Event</Badge>
                  <span className="text-label-xs text-muted-foreground">• {values.hours} Hours</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-label-xs pt-2 border-t border-border/50">
                <div>
                  <span className="text-muted-foreground block">Starts At</span>
                  <span className="font-medium text-foreground">{values.startsAt}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Venue</span>
                  <span className="font-medium text-foreground truncate block">{values.venue}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-label-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Simulation Environment Notice</span>
              </div>
              <p>Client validation ensures date consistency. No persistent database writes are made during this demonstration.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={submitting} onClick={() => setReviewOpen(false)} className="text-label-sm">
              Back to Editing
            </Button>
            <Button disabled={submitting} onClick={handleConfirmSubmit} className="text-label-sm">
              {submitting ? "Scheduling..." : "Confirm & Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Project Event Form Component
// ============================================================================
function ProjectEventForm() {
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProjectEventFormValues>({
    resolver: zodResolver(projectEventSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      categoryId: 2,
      hostProject: "Dhara",
      hasCollaboration: false,
      collabProjects: [],
      startsAt: "2026-11-15T09:00",
      endsAt: "2026-11-15T17:00",
      hours: 5,
      slotsTotal: 40,
      capYear2: 20,
      capYear3: 15,
      capYear4: 5,
      fcfsOpensAt: "2026-11-08T18:00",
      fcfsLockAt: "2026-11-08T19:00",
      notes: "",
    },
  });

  const { errors } = form.formState;
  const values = useWatch({ control: form.control });

  const handleReview = () => {
    form.handleSubmit(
      () => setReviewOpen(true),
      (errs) => {
        const firstKey = Object.keys(errs)[0];
        const msg = (errs as Record<string, { message?: string }>)[firstKey]?.message;
        toast.error("Form Validation Error", {
          description: msg || "Please correct the highlighted fields.",
        });
      }
    )();
  };

  const handleConfirmSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setReviewOpen(false);
      toast.success("Project Event Scheduled (Simulated)", {
        description: `Project drive scheduled for ${values.hostProject}. Roster entries will be verified against slots.`,
      });
      router.push("/events");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-body-sm">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Project Wing Outreach Scheduler</p>
          <p className="text-muted-foreground text-label-sm">
            Host wing volunteers are automatically eligible (SRS §11.3). FCFS entry applies to external collaborating wings.
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Core Information */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Building2 className="size-4.5 text-emerald-500" />
            <h3 className="text-headline-sm font-semibold text-foreground">1. Wing &amp; Core Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="hostProject" className="text-label-sm font-medium">
                Host Project Wing <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="hostProject"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => { if (val) field.onChange(val); }}>
                    <SelectTrigger id="hostProject" className="bg-background border-border">
                      <SelectValue placeholder="Select Host Wing" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.hostProject && <p className="text-destructive text-label-xs font-medium">{errors.hostProject.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="title" className="text-label-sm font-medium">
                Event Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Urban Mangrove Plantation Phase II"
                {...form.register("title")}
                className="bg-background border-border"
              />
              {errors.title && <p className="text-destructive text-label-xs font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-label-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(Number(val));
                      const cat = EVENT_CATEGORIES.find((c) => c.id === Number(val));
                      if (cat) form.setValue("hours", cat.defaultHours);
                    }}
                  >
                    <SelectTrigger id="categoryId" className="bg-background border-border">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name} ({cat.defaultHours}h)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-destructive text-label-xs font-medium">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue" className="text-label-sm font-medium">
                Venue Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="venue"
                  placeholder="e.g., Chandaka Buffer Sector 4"
                  {...form.register("venue")}
                  className="pl-9 bg-background border-border"
                />
              </div>
              {errors.venue && <p className="text-destructive text-label-xs font-medium">{errors.venue.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description" className="text-label-sm font-medium">
                Description &amp; SDGs <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Detail the target goals, external partner agencies, community beneficiaries..."
                {...form.register("description")}
                className="bg-background border-border"
              />
              {errors.description && <p className="text-destructive text-label-xs font-medium">{errors.description.message}</p>}
            </div>
          </div>
        </Card>

        {/* Schedule & Hours */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Clock className="size-4.5 text-amber-500" />
            <h3 className="text-headline-sm font-semibold text-foreground">2. Schedule &amp; Credit (IST)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" className="text-label-sm font-medium">
                Starts At (IST) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...form.register("startsAt")}
                className="bg-background border-border text-body-sm"
              />
              {errors.startsAt && <p className="text-destructive text-label-xs font-medium">{errors.startsAt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endsAt" className="text-label-sm font-medium">
                Ends At (IST)
              </Label>
              <Input
                id="endsAt"
                type="datetime-local"
                {...form.register("endsAt")}
                className="bg-background border-border text-body-sm"
              />
              {errors.endsAt && <p className="text-destructive text-label-xs font-medium">{errors.endsAt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hours" className="text-label-sm font-medium">
                Service Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hours"
                type="number"
                min={0}
                max={100}
                {...form.register("hours")}
                className="bg-background border-border"
              />
              {errors.hours && <p className="text-destructive text-label-xs font-medium">{errors.hours.message}</p>}
            </div>
          </div>
        </Card>

        {/* Slots & Collaboration */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Users className="size-4.5 text-primary" />
            <h3 className="text-headline-sm font-semibold text-foreground">3. Slot Capacities &amp; FCFS Window</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="slotsTotal" className="text-label-sm font-medium">
                Total Wing Slots <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slotsTotal"
                type="number"
                min={5}
                max={200}
                {...form.register("slotsTotal")}
                className="bg-background border-border"
              />
              {errors.slotsTotal && <p className="text-destructive text-label-xs font-medium">{errors.slotsTotal.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capYear2" className="text-label-sm font-medium">2nd Year Cap</Label>
              <Input id="capYear2" type="number" placeholder="e.g. 20" {...form.register("capYear2")} className="bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capYear3" className="text-label-sm font-medium">3rd Year Cap</Label>
              <Input id="capYear3" type="number" placeholder="e.g. 15" {...form.register("capYear3")} className="bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capYear4" className="text-label-sm font-medium">4th Year Cap</Label>
              <Input id="capYear4" type="number" placeholder="e.g. 5" {...form.register("capYear4")} className="bg-background border-border" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="fcfsOpensAt" className="text-label-sm font-medium">
                FCFS Window Opens (IST) <span className="text-destructive">*</span>
              </Label>
              <Input id="fcfsOpensAt" type="datetime-local" {...form.register("fcfsOpensAt")} className="bg-background border-border text-body-sm" />
              {errors.fcfsOpensAt && <p className="text-destructive text-label-xs font-medium">{errors.fcfsOpensAt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fcfsLockAt" className="text-label-sm font-medium">
                FCFS Window Closes / Locks (IST) <span className="text-destructive">*</span>
              </Label>
              <Input id="fcfsLockAt" type="datetime-local" {...form.register("fcfsLockAt")} className="bg-background border-border text-body-sm" />
              {errors.fcfsLockAt && <p className="text-destructive text-label-xs font-medium">{errors.fcfsLockAt.message}</p>}
            </div>
          </div>

          {/* Collaboration Checkbox */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasCollaboration"
                {...form.register("hasCollaboration")}
                className="size-4 rounded text-primary"
              />
              <Label htmlFor="hasCollaboration" className="text-body-sm font-medium cursor-pointer">
                Multi-Wing Collaboration (Invite up to 2 other projects, S-09)
              </Label>
            </div>

            {values.hasCollaboration && (
              <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                <p className="text-label-xs text-muted-foreground">
                  Select collaborating wings (host PR approval required):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PROJECT_NAMES.filter((p) => p !== values.hostProject).map((proj) => {
                    const current = values.collabProjects || [];
                    const isSelected = current.includes(proj);
                    return (
                      <button
                        type="button"
                        key={proj}
                        onClick={() => {
                          if (isSelected) {
                            form.setValue("collabProjects", current.filter((x) => x !== proj));
                          } else if (current.length < 2) {
                            form.setValue("collabProjects", [...current, proj]);
                          } else {
                            toast.warning("Limit Reached", {
                              description: "Maximum 2 collaborating wings allowed (SRS §11.3).",
                            });
                          }
                        }}
                        className={`text-left text-label-xs px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {proj}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => router.push("/events")} className="text-label-sm">
            Cancel
          </Button>
          <Button type="button" onClick={handleReview} className="text-label-sm shadow-xs">
            Review Event Details
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </div>
      </form>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-headline-sm">
              <CheckCircle2 className="size-5 text-primary" />
              Review Project Wing Drive
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground">
              Inspect details before scheduling. Collaborating wings will receive approval notices (SRS §11.3).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-2 text-body-sm">
            <div className="p-3.5 rounded-xl bg-muted/40 space-y-2 border border-border">
              <div>
                <span className="text-label-xs uppercase tracking-wider text-muted-foreground block">
                  Title &amp; Host Wing
                </span>
                <span className="font-semibold text-foreground">{values.title || "Untitled"}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-label-xs">{values.hostProject} Wing</Badge>
                  <span className="text-label-xs text-muted-foreground">• {values.hours} Service Hours</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-label-xs pt-2 border-t border-border/50">
                <div>
                  <span className="text-muted-foreground block">Starts At</span>
                  <span className="font-medium text-foreground">{values.startsAt}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Venue</span>
                  <span className="font-medium text-foreground truncate block">{values.venue}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-label-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Simulation Notice</span>
              </div>
              <p>Client guardrails validate slots and timing offsets. No persistent database mutations are made.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={submitting} onClick={() => setReviewOpen(false)} className="text-label-sm">
              Back to Editing
            </Button>
            <Button disabled={submitting} onClick={handleConfirmSubmit} className="text-label-sm">
              {submitting ? "Scheduling..." : "Confirm & Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
