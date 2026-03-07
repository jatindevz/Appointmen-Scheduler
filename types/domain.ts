import type { AppRole } from "@/constants/roles";

export type UserProfile = {
  id: string;
  fullName: string;
  role: AppRole;
  createdAt: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
};

export type AvailabilityWindow = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type AppointmentStatus = "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  userId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
  service?: ServiceItem;
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
};
