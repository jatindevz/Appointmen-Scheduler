import { supabase } from "@/lib/supabase";
import type { Appointment, AppointmentStatus, AvailabilityWindow } from "@/types/domain";

function mapAppointment(item: {
  id: string;
  user_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
  services?: {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
  } | null;
}): Appointment {
  return {
    id: item.id,
    userId: item.user_id,
    serviceId: item.service_id,
    appointmentDate: item.appointment_date,
    startTime: item.start_time,
    endTime: item.end_time,
    status: item.status,
    createdAt: item.created_at,
    service: item.services
      ? {
          id: item.services.id,
          name: item.services.name,
          description: item.services.description,
          durationMinutes: item.services.duration_minutes,
          price: Number(item.services.price),
        }
      : undefined,
  };
}

function mapAvailability(item: { id: string; weekday: number; start_time: string; end_time: string }): AvailabilityWindow {
  return {
    id: item.id,
    weekday: item.weekday,
    startTime: item.start_time,
    endTime: item.end_time,
  };
}

export const adminService = {
  async getDailySchedule(date: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, user_id, service_id, appointment_date, start_time, end_time, status, created_at, services(id, name, description, duration_minutes, price)",
      )
      .eq("appointment_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapAppointment);
  },

  async getWeeklySchedule(startDate: string, endDate: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, user_id, service_id, appointment_date, start_time, end_time, status, created_at, services(id, name, description, duration_minutes, price)",
      )
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate)
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapAppointment);
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      throw error;
    }
  },

  async listAvailability(): Promise<AvailabilityWindow[]> {
    const { data, error } = await supabase
      .from("availability")
      .select("id, weekday, start_time, end_time")
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) {
      throw error;
    }

    return data.map(mapAvailability);
  },

  async createAvailability(input: { weekday: number; startTime: string; endTime: string }) {
    const { error } = await supabase.from("availability").insert({
      weekday: input.weekday,
      start_time: input.startTime,
      end_time: input.endTime,
    });

    if (error) {
      throw error;
    }
  },

  async removeAvailability(id: string) {
    const { error } = await supabase.from("availability").delete().eq("id", id);
    if (error) {
      throw error;
    }
  },
};
