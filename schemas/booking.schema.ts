import { z } from "zod";

export const bookAppointmentSchema = z.object({
  serviceId: z.uuid("Invalid service id"),
  appointmentDate: z.string().min(10, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Time must be HH:MM:SS"),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
