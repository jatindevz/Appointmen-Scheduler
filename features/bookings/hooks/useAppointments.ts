import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";
import type { Appointment, ServiceItem } from "@/types/domain";

import { bookingsService } from "../bookings.service";

export function useAppointments(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.appointments(userId),
    queryFn: () => bookingsService.listUserAppointments(userId ?? ""),
    enabled: Boolean(userId),
  });
}

export function useTimeSlots(params: { date: string; service: ServiceItem | null }) {
  const { date, service } = params;

  return useQuery({
    queryKey: QUERY_KEYS.bookings.availability(date, service?.id ?? ""),
    queryFn: async () => {
      if (!service) {
        return [];
      }

      const [availability, booked] = await Promise.all([
        bookingsService.getAvailabilityForDate(date),
        bookingsService.getBookedSlots(date, service.id),
      ]);

      return bookingsService.generateTimeSlots(date, service, availability, booked);
    },
    enabled: Boolean(service?.id),
  });
}

export function useBookAppointment(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.bookAppointment,
    onSuccess: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.appointments(userId) });
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
    },
  });
}

export function useCancelAppointment(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.cancelAppointment,
    onMutate: async (appointmentId) => {
      if (!userId) {
        return { previous: [] as Appointment[] };
      }

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bookings.appointments(userId) });
      const previous = queryClient.getQueryData<Appointment[]>(QUERY_KEYS.bookings.appointments(userId)) ?? [];

      queryClient.setQueryData<Appointment[]>(QUERY_KEYS.bookings.appointments(userId), (current = []) =>
        current.map((item) => (item.id === appointmentId ? { ...item, status: "cancelled" } : item)),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (userId && context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.bookings.appointments(userId), context.previous);
      }
    },
    onSettled: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.appointments(userId) });
      }
    },
  });
}
