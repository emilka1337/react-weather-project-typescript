import { create } from "zustand";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";

interface ForecastStore {
    forecast: ForecastUnit[];
    setForecast: (forecast: ForecastUnit[]) => void;
}

export const useForecastStore = create<ForecastStore>((set) => ({
    forecast: [],
    setForecast: (forecast: ForecastUnit[]) => set({ forecast }),
}));
