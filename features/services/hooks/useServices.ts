import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";

import { servicesService } from "../services.service";

export function useServices() {
  return useQuery({
    queryKey: QUERY_KEYS.services.all,
    queryFn: servicesService.list,
  });
}
