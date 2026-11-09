"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Power, Tag } from "lucide-react";
import { notify } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdjustmentType } from "@/types/hours";
import {
  adjustmentTypeSchema,
  type AdjustmentTypeValues,
} from "./hours-schemas";

interface AdjustmentTagsPanelProps {
  initialTags: AdjustmentType[];
}

export function AdjustmentTagsPanel({ initialTags }: AdjustmentTagsPanelProps) {
  const [tags, setTags] = useState<AdjustmentType[]>(initialTags);
  const [open, setOpen] = useState(false);

  const form = useForm<AdjustmentTypeValues>({
    resolver: zodResolver(adjustmentTypeSchema),
    defaultValues: { name: "", defaultHours: 2 },
  });

  const submit = (values: AdjustmentTypeValues) => {
    const duplicate = tags.some(
      (tag) => tag.name.toLowerCase() === values.name.toLowerCase(),
    );
    if (duplicate) {
      form.setError("name", { message: "A tag with this name already exists" });
      return;
    }

    const nextId = Math.max(...tags.map((tag) => tag.id), 0) + 1;
    setTags((current) => [
      ...current,
      {
        id: nextId,
        name: values.name,
        defaultHours: values.defaultHours,
        isActive: true,
      },
    ]);
    notify("success", "Tag created", {
      description: `"${values.name}" defaults to ${values.defaultHours}h for everyone.`,
    });
    form.reset({ name: "", defaultHours: 2 });
    setOpen(false);
  };

  const toggleActive = (tag: AdjustmentType) => {
    setTags((current) =>
      current.map((item) =>
        item.id === tag.id ? { ...item, isActive: !item.isActive } : item,
      ),
    );
    notify("info", tag.isActive ? "Tag deactivated" : "Tag reactivated", {
      description: tag.isActive
        ? "Existing hours keep their label; new adjustments can no longer pick it."
        : "The tag is selectable again for new adjustments.",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-headline-sm flex items-center gap-2 text-foreground">
              <Tag className="size-4 text-primary" />
              Adjustment tags
            </h2>
            <p className="mt-0.5 max-w-2xl text-body-sm text-muted-foreground">
              Tags keep extra hours consistent: everyone who photographs an
              event claims the same default. Create them once, then pick one
              when adding hours.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="h-8 shrink-0 text-label-xs"
          >
            <Plus className="mr-1.5 size-3.5" />
            New tag
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[55%]">Tag</TableHead>
                <TableHead className="w-[15%] text-center">
                  Default hours
                </TableHead>
                <TableHead className="w-[15%]">State</TableHead>
                <TableHead className="w-[15%] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id} className="hover:bg-muted/20">
                  <TableCell className="py-3 text-body-sm font-medium text-foreground">
                    {tag.name}
                  </TableCell>
                  <TableCell className="py-3 text-center text-body-sm">
                    {tag.defaultHours}h
                  </TableCell>
                  <TableCell className="py-3">
                    {tag.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-success/30 bg-success-container/60 text-[11px] text-success"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted/60 text-[11px] text-muted-foreground"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(tag)}
                      className="h-7 px-2.5 text-label-xs"
                    >
                      <Power className="mr-1 size-3" />
                      {tag.isActive ? "Deactivate" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Tags are never deleted, only deactivated, so old hours keep a readable
          label.
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-headline-sm">
              New adjustment tag
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground">
              Coordinators and Tech define the tag once; everyone then starts
              from the same hours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tagName" className="text-label-sm font-medium">
                Tag name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tagName"
                placeholder="e.g. Photography at an event"
                {...form.register("name")}
                className="border-border bg-background"
              />
              {form.formState.errors.name && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagHours" className="text-label-sm font-medium">
                Default hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tagHours"
                type="number"
                step={0.5}
                {...form.register("defaultHours", { valueAsNumber: true })}
                className="border-border bg-background"
              />
              {form.formState.errors.defaultHours && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.defaultHours.message}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Negative values are allowed for deductions; zero is not.
              </p>
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
                Create tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
