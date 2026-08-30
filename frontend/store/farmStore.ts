import { create } from "zustand";

interface FarmState {
  selectedFarmId: string | null;
  setSelectedFarmId: (id: string | null) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  selectedFarmId: null,
  setSelectedFarmId: (id) => set({ selectedFarmId: id }),
}));
