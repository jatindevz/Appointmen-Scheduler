import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive("Duration must be greater than 0"),
  price: z.number().min(0, "Price cannot be negative"),
});

export const availabilitySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Time must be HH:MM:SS"),
    endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Time must be HH:MM:SS"),
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  });

export type ServiceFormInput = z.infer<typeof serviceSchema>;
export type AvailabilityFormInput = z.infer<typeof availabilitySchema>;
