import { supabase } from "@/lib/supabase";
import type { ServiceItem } from "@/types/domain";

function mapService(item: {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}): ServiceItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    durationMinutes: item.duration_minutes,
    price: Number(item.price),
  };
}

export const servicesService = {
  async list(): Promise<ServiceItem[]> {
    const { data, error } = await supabase.from("services").select("id, name, description, duration_minutes, price").order("name");

    if (error) {
      throw error;
    }

    return data.map(mapService);
  },

  async create(input: Omit<ServiceItem, "id">) {
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: input.name,
        description: input.description,
        duration_minutes: input.durationMinutes,
        price: input.price,
      })
      .select("id, name, description, duration_minutes, price")
      .single();

    if (error) {
      throw error;
    }

    return mapService(data);
  },

  async update(serviceId: string, input: Omit<ServiceItem, "id">) {
    const { data, error } = await supabase
      .from("services")
      .update({
        name: input.name,
        description: input.description,
        duration_minutes: input.durationMinutes,
        price: input.price,
      })
      .eq("id", serviceId)
      .select("id, name, description, duration_minutes, price")
      .single();

    if (error) {
      throw error;
    }

    return mapService(data);
  },

  async remove(serviceId: string) {
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    if (error) {
      throw error;
    }
  },
};
