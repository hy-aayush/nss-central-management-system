"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTimeIST } from "@/lib/time";
import type { Meeting } from "@/types/event";
import { countMomWords, momSchema, type MomValues } from "./meeting-schemas";

interface MeetingMinutesPanelProps {
  meeting: Meeting;
  mom: string | null;
  momBy: string | null;
  momAt: string | null;
  editsLeft: number | null;
  editable: boolean;
  onSave: (mom: string) => void;
}

export function MeetingMinutesPanel({
  meeting,
  mom,
  momBy,
  momAt,
  editsLeft,
  editable,
  onSave,
}: MeetingMinutesPanelProps) {
  const form = useForm<MomValues>({
    resolver: zodResolver(momSchema),
    defaultValues: { mom: mom ?? "" },
  });

  useEffect(() => {
    form.reset({ mom: mom ?? "" });
  }, [mom, form]);

  const value = useWatch({ control: form.control, name: "mom" }) ?? "";
  const words = countMomWords(value);

  const submit = (values: MomValues) => {
    onSave(values.mom);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-headline-sm flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-primary" />
              Minutes of meeting
            </h2>
            <p className="mt-0.5 max-w-2xl text-body-sm text-muted-foreground">
              A short record, at most 100 words. Written only after the meeting
              is completed; the creator and the project representative can edit
              it inside the budget, Coordinators and Tech at any time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {momAt && (
              <span className="text-label-xs text-muted-foreground">
                Last saved {formatDateTimeIST(momAt)}
              </span>
            )}
            {editsLeft !== null && (
              <Badge
                variant="outline"
                className="border-border bg-muted/50 text-[11px] text-muted-foreground"
              >
                {editsLeft} edit{editsLeft === 1 ? "" : "s"} left
              </Badge>
            )}
          </div>
        </div>

        {!editable && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-container-low/40 p-3 text-[11px] text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            {meeting.status === "COMPLETED"
              ? "Minutes cannot be edited in this state."
              : "Minutes unlock when the meeting is completed."}
          </div>
        )}

        <form onSubmit={form.handleSubmit(submit)} className="space-y-2">
          <Textarea
            rows={7}
            value={value}
            onChange={(event) =>
              form.setValue("mom", event.target.value, { shouldValidate: true })
            }
            disabled={!editable}
            placeholder="What was decided, who owns each action and by when. One paragraph is usually enough."
            className="border-border bg-background leading-relaxed"
            aria-label="Minutes of meeting"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span
                className={`block text-label-xs ${words > 100 ? "font-medium text-destructive" : "text-muted-foreground"}`}
              >
                {words}/100 words
              </span>
              {form.formState.errors.mom && (
                <p className="text-label-xs font-medium text-destructive">
                  {form.formState.errors.mom.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!editable || !form.formState.isDirty}
              className="h-8 text-label-xs"
            >
              <Save className="mr-1.5 size-3.5" />
              Save minutes
            </Button>
          </div>
        </form>

        {momBy && (
          <p className="border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
            Recorded by{" "}
            <span className="font-mono text-foreground">{momBy}</span>
            {momAt ? ` on ${formatDateTimeIST(momAt)}` : ""}.
          </p>
        )}
      </Card>
    </div>
  );
}
