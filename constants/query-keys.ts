export const QUERY_KEYS = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  services: {
    all: ["services"] as const,
  },
  bookings: {
    appointments: (userId: string | null) => ["bookings", "appointments", userId] as const,
    availability: (date: string, serviceId: string) => ["bookings", "availability", date, serviceId] as const,
  },
  admin: {
    dailySchedule: (date: string) => ["admin", "schedule", "daily", date] as const,
    weeklySchedule: (weekStartDate: string) => ["admin", "schedule", "weekly", weekStartDate] as const,
    availability: ["admin", "availability"] as const,
  },
};
