import { z } from "zod";

import { PROJECT_NAMES } from "@/types/project";

/** SRS 8.4: agenda 3–500, venue 2–160, MOM ≤ 100 words (DB caps 800 chars). */
export const MEETING_TYPES = ["PROJECT", "CENTRAL", "BUILDERS"] as const;

export const meetingSchema = z
  .object({
    type: z.enum(MEETING_TYPES),
    project: z.string().optional(),
    agenda: z
      .string()
      .trim()
      .min(3, "Agenda must be at least 3 characters")
      .max(500, "Agenda cannot exceed 500 characters"),
    date: z.string().min(1, "Pick the meeting day"),
    startTime: z.string().min(1, "Pick a start time"),
    endTime: z.string().optional(),
    venue: z
      .string()
      .trim()
      .min(2, "Venue must be at least 2 characters")
      .max(160, "Venue cannot exceed 160 characters"),
    startNow: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "PROJECT") {
      if (!values.project || !PROJECT_NAMES.includes(values.project as never)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project meetings belong to exactly one project",
          path: ["project"],
        });
      }
    }
    if (values.endTime && values.endTime <= values.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after the start time",
        path: ["endTime"],
      });
    }
  });

export type MeetingFormValues = z.infer<typeof meetingSchema>;

export const cancellationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Give a reason of at least 10 characters")
    .max(300, "Reason cannot exceed 300 characters"),
});

export type CancellationValues = z.infer<typeof cancellationSchema>;

export function countMomWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export const momSchema = z.object({
  mom: z
    .string()
    .trim()
    .min(10, "Write at least a sentence")
    .refine((value) => countMomWords(value) <= 100, {
      message: "Minutes of meeting must stay within 100 words",
    }),
});

export type MomValues = z.infer<typeof momSchema>;

export const meetingCorrectionSchema = z
  .object({
    oldStatus: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    newStatus: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    reason: z
      .string()
      .trim()
      .min(10, "Explain the correction in at least 10 characters")
      .max(300, "Reason cannot exceed 300 characters"),
  })
  .superRefine((values, ctx) => {
    if (values.oldStatus === values.newStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a different status",
        path: ["newStatus"],
      });
    }
  });

export type MeetingCorrectionValues = z.infer<typeof meetingCorrectionSchema>;
