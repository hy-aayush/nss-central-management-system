import { z } from "zod";

const hoursValue = z
  .number({ message: "Enter the hours" })
  .refine((value) => value !== 0, "Hours cannot be zero")
  .refine(
    (value) => value >= -200 && value <= 200,
    "Hours must be between -200 and 200",
  );

export const adjustmentTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Tag name must be at least 3 characters")
    .max(60, "Tag name cannot exceed 60 characters"),
  defaultHours: hoursValue,
});

export type AdjustmentTypeValues = z.infer<typeof adjustmentTypeSchema>;

export const hoursAdjustmentSchema = z.object({
  rollNumbers: z
    .array(z.string())
    .min(1, "Pick at least one volunteer")
    .max(100, "A bulk save accepts at most 100 volunteers"),
  typeId: z.number({ message: "Pick a tag" }).min(1, "Pick a tag"),
  occurredOn: z.string().min(1, "Pick the day the work happened"),
  hours: hoursValue,
  description: z
    .string()
    .trim()
    .min(10, "Describe the work in at least 10 characters")
    .max(300, "Description cannot exceed 300 characters"),
  eventId: z.string().optional(),
});

export type HoursAdjustmentValues = z.infer<typeof hoursAdjustmentSchema>;
