import { z } from "zod";
import { PROJECT_NAMES } from "@/types/project";

export const EVENT_CATEGORIES = [
  { id: 1, name: "Blood donation", defaultHours: 8 },
  { id: 2, name: "Plantation drive", defaultHours: 5 },
  { id: 3, name: "Rally / Awareness Walk", defaultHours: 4 },
  { id: 4, name: "Health & Hygiene Camp", defaultHours: 6 },
  { id: 5, name: "Educational & Teaching Drive", defaultHours: 4 },
  { id: 6, name: "Slum & Community Visit", defaultHours: 5 },
  { id: 7, name: "Cleanliness & Swachhata Drive", defaultHours: 4 },
  { id: 8, name: "Skill Workshop & Training", defaultHours: 4 },
  { id: 9, name: "Special Camp / Mega Drive", defaultHours: 50 },
] as const;

export { PROJECT_NAMES };

// Base reusable schema for core event parameters
const baseEventSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must provide at least 10 characters of detail")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),
  venue: z
    .string()
    .min(3, "Venue must be at least 3 characters")
    .max(100, "Venue cannot exceed 100 characters")
    .trim(),
  categoryId: z.number().min(1, "Please select an event category"),
  startsAt: z.string().min(1, "Start date and time is required"),
  endsAt: z.string().optional().or(z.literal("")),
  hours: z.number().min(0, "Hours cannot be negative").max(100, "Max 100 hours"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Central Event Schema
export const centralEventSchema = baseEventSchema
  .extend({
    participation: z.enum(["FCFS", "OPEN_TO_ALL"], {
      message: "Please select participation mode",
    }),
    fcfsOpensAt: z.string().optional().or(z.literal("")),
    fcfsLockAt: z.string().optional().or(z.literal("")),
    capacityTotal: z.number().min(10, "Minimum capacity is 10").max(500, "Max capacity is 500"),
    // Slot distribution across the 9 projects if FCFS
    slotsBandhutva: z.number().min(0),
    slotsDhara: z.number().min(0),
    slotsNidaan: z.number().min(0),
    slotsRiddhi: z.number().min(0),
    slotsSanyukt: z.number().min(0),
    slotsSparsh: z.number().min(0),
    slotsSwet: z.number().min(0),
    slotsUdaan: z.number().min(0),
    slotsUrja: z.number().min(0),
  })
  .superRefine((data, ctx) => {
    // 1. Verify endsAt >= startsAt if provided
    if (data.endsAt && data.startsAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Event end time must be after start time",
          path: ["endsAt"],
        });
      }
    }

    // 2. If FCFS, verify opens and lock windows
    if (data.participation === "FCFS") {
      if (!data.fcfsOpensAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FCFS opening date & time is required for FCFS drives",
          path: ["fcfsOpensAt"],
        });
      }
      if (!data.fcfsLockAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FCFS closing/lock date & time is required for FCFS drives",
          path: ["fcfsLockAt"],
        });
      }
      if (data.fcfsOpensAt && data.fcfsLockAt) {
        const open = new Date(data.fcfsOpensAt).getTime();
        const lock = new Date(data.fcfsLockAt).getTime();
        const start = new Date(data.startsAt).getTime();

        if (lock <= open) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "FCFS lock time must be after FCFS opening time",
            path: ["fcfsLockAt"],
          });
        }
        if (start && lock > start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "FCFS roster must lock at or before event start time (SRS §11.3)",
            path: ["fcfsLockAt"],
          });
        }
      }
    }
  });

export type CentralEventFormValues = z.infer<typeof centralEventSchema>;

// Project Event Schema
export const projectEventSchema = baseEventSchema
  .extend({
    hostProject: z.string().min(1, "Please select the host project"),
    hasCollaboration: z.boolean(),
    collabProjects: z.array(z.string()).max(2, "At most 2 collaborating wings allowed (max 3 wings total, S-09)"),
    slotsTotal: z.number().min(5, "Minimum slot allocation is 5").max(200, "Max slots 200"),
    capYear2: z.number().min(0).max(100).optional(),
    capYear3: z.number().min(0).max(100).optional(),
    capYear4: z.number().min(0).max(100).optional(),
    fcfsOpensAt: z.string().min(1, "FCFS opening time is required"),
    fcfsLockAt: z.string().min(1, "FCFS closing time is required"),
  })
  .superRefine((data, ctx) => {
    // 1. Verify endsAt >= startsAt
    if (data.endsAt && data.startsAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Event end time must be after start time",
          path: ["endsAt"],
        });
      }
    }

    // 2. Verify year caps do not exceed slotsTotal
    const sumCaps = (data.capYear2 ?? 0) + (data.capYear3 ?? 0) + (data.capYear4 ?? 0);
    if (sumCaps > data.slotsTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Sum of year-wise caps (${sumCaps}) cannot exceed total project slots (${data.slotsTotal})`,
        path: ["slotsTotal"],
      });
    }

    // 3. Verify FCFS window
    if (data.fcfsOpensAt && data.fcfsLockAt) {
      const open = new Date(data.fcfsOpensAt).getTime();
      const lock = new Date(data.fcfsLockAt).getTime();
      const start = new Date(data.startsAt).getTime();

      if (lock <= open) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FCFS lock time must be after FCFS opening time",
          path: ["fcfsLockAt"],
        });
      }
      if (start && lock > start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FCFS must lock before or at event start time",
          path: ["fcfsLockAt"],
        });
      }
    }

    // 4. If collaboration, cannot collaborate with own host project
    if (data.hasCollaboration && data.collabProjects.includes(data.hostProject)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Collaborating project cannot be the same as the host project",
        path: ["collabProjects"],
      });
    }
  });

export type ProjectEventFormValues = z.infer<typeof projectEventSchema>;
