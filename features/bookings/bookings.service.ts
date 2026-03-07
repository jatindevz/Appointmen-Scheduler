import { formatTimeLabel, getWeekday, isPastDateTime, minutesToTime, timeToMinutes } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import type { Appointment, AppointmentStatus, AvailabilityWindow, ServiceItem, TimeSlot } from "@/types/domain";

function mapAppointment(input: {
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
    id: input.id,
    userId: input.user_id,
    serviceId: input.service_id,
    appointmentDate: input.appointment_date,
    startTime: input.start_time,
    endTime: input.end_time,
    status: input.status,
    createdAt: input.created_at,
    service: input.services
      ? {
          id: input.services.id,
          name: input.services.name,
          description: input.services.description,
          durationMinutes: input.services.duration_minutes,
          price: Number(input.services.price),
        }
      : undefined,
  };
}

function mapAvailability(input: { id: string; weekday: number; start_time: string; end_time: string }): AvailabilityWindow {
  return {
    id: input.id,
    weekday: input.weekday,
    startTime: input.start_time,
    endTime: input.end_time,
  };
}

export const bookingsService = {
  async listUserAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, user_id, service_id, appointment_date, start_time, end_time, status, created_at, services(id, name, description, duration_minutes, price)",
      )
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapAppointment);
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId);
    if (error) {
      throw error;
    }
  },

  async getAvailabilityForDate(date: string): Promise<AvailabilityWindow[]> {
    const weekday = getWeekday(date);
    const { data, error } = await supabase
      .from("availability")
      .select("id, weekday, start_time, end_time")
      .eq("weekday", weekday)
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapAvailability);
  },

  async getBookedSlots(date: string, serviceId: string): Promise<Array<{ startTime: string; endTime: string }>> {
    const { data, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("appointment_date", date)
      .eq("service_id", serviceId)
      .eq("status", "confirmed")
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((item) => ({ startTime: item.start_time, endTime: item.end_time }));
  },

  generateTimeSlots(
    date: string,
    service: ServiceItem,
    availability: AvailabilityWindow[],
    bookedSlots: Array<{ startTime: string; endTime: string }>,
  ): TimeSlot[] {
    const duration = service.durationMinutes;

    const slots: TimeSlot[] = [];

    const isBooked = (candidateStart: string, candidateEnd: string) => {
      const start = timeToMinutes(candidateStart);
      const end = timeToMinutes(candidateEnd);

      return bookedSlots.some((slot) => {
        const bookedStart = timeToMinutes(slot.startTime);
        const bookedEnd = timeToMinutes(slot.endTime);
        return start < bookedEnd && end > bookedStart;
      });
    };

    for (const window of availability) {
      let cursor = timeToMinutes(window.startTime);
      const limit = timeToMinutes(window.endTime);

      while (cursor + duration <= limit) {
        const startTime = minutesToTime(cursor);
        const endTime = minutesToTime(cursor + duration);
        const blocked = isBooked(startTime, endTime);
        const past = isPastDateTime(date, startTime);

        if (!blocked && !past) {
          slots.push({
            startTime,
            endTime,
            label: `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`,
            available: true,
          });
        }

        cursor += duration;
      }
    }

    return slots;
  },

  async bookAppointment(input: { serviceId: string; appointmentDate: string; startTime: string }): Promise<Appointment> {
    const { data, error } = await supabase.rpc("book_appointment", {
      p_service_id: input.serviceId,
      p_appointment_date: input.appointmentDate,
      p_start_time: input.startTime,
    });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error("Booking failed");
    }

    return mapAppointment(row);
  },
};
