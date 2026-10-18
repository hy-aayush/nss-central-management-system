import { z } from "zod";

export const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "EXCUSED"]);

export const attendanceCorrectionSchema = z.object({
  eventId: z.number(),
  rollNumber: z.string().min(5, "Valid student roll number required"),
  oldStatus: attendanceStatusEnum,
  newStatus: attendanceStatusEnum,
  reason: z
    .string()
    .min(10, "Audit reason must be at least 10 characters explaining why this correction is necessary (SRS §11.7)")
    .max(300, "Audit reason cannot exceed 300 characters")
    .trim(),
});

export type AttendanceCorrectionFormValues = z.infer<typeof attendanceCorrectionSchema>;

export const bulkMarkSchema = z.object({
  eventId: z.coerce.number(),
  targetStatus: attendanceStatusEnum,
  rollNumbers: z.array(z.string()).min(1, "Select at least one volunteer to mark"),
});

export type BulkMarkFormValues = z.infer<typeof bulkMarkSchema>;
