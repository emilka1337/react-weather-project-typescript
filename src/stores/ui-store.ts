import { create } from "zustand";

interface CitySearchMenuStore {
    showCitySearchMenu: boolean;
    setShowCitySearchMenu: (showCitySearchMenu: boolean) => void;
}

export const useCitySearchMenuStore = create<CitySearchMenuStore>((set) => ({
    showCitySearchMenu: false,
    setShowCitySearchMenu: (showCitySearchMenu: boolean) => set({ showCitySearchMenu }),
}));
