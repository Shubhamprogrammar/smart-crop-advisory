"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import * as farmsApi from "@/lib/api/farms";
import { useFarmStore } from "@/store/farmStore";

export function useFarms() {
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const setSelectedFarmId = useFarmStore((s) => s.setSelectedFarmId);

  const query = useQuery({
    queryKey: ["farms"],
    queryFn: () => farmsApi.listFarms(),
  });

  useEffect(() => {
    if (!selectedFarmId && query.data?.farms.length) {
      setSelectedFarmId(query.data.farms[0].id);
    }
  }, [query.data, selectedFarmId, setSelectedFarmId]);

  return query;
}
