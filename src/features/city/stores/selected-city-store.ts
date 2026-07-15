import { create } from "zustand";

interface SelectedCityStore {
    selectedCity: string;
    setSelectedCity: (selectedCity: string) => void;
}

export const useSelectedCityStore = create<SelectedCityStore>((set) => ({
    selectedCity: "Loading",
    setSelectedCity: (selectedCity: string) => set({ selectedCity }),
}));
