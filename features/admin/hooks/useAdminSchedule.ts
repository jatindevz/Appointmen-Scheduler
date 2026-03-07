import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";

import { adminService } from "../admin.service";

type WeekRange = {
  startDate: string;
  endDate: string;
};

export function useAdminSchedule(date: string, weekRange: WeekRange) {
  const daily = useQuery({
    queryKey: QUERY_KEYS.admin.dailySchedule(date),
    queryFn: () => adminService.getDailySchedule(date),
  });

  const weekly = useQuery({
    queryKey: QUERY_KEYS.admin.weeklySchedule(weekRange.startDate),
    queryFn: () => adminService.getWeeklySchedule(weekRange.startDate, weekRange.endDate),
  });

  return { daily, weekly };
}

export function useUpdateAppointmentStatus(date: string, weekStartDate: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "cancelled" }) =>
      adminService.updateAppointmentStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dailySchedule(date) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.weeklySchedule(weekStartDate) }),
      ]);
    },
  });
}

export function useAdminAvailability() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.availability,
    queryFn: adminService.listAvailability,
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createAvailability,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.availability });
    },
  });
}

export function useRemoveAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.removeAvailability,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.availability });
    },
  });
}
