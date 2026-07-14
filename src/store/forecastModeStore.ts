import { create } from "zustand";
import { ForecastModes } from "../enums/ForecastMode";

interface ForecastModeStore {
    forecastMode: ForecastModes;
    setForecastMode: (forecastMode: ForecastModes) => void;
}

export const useForecastModeStore = create<ForecastModeStore>((set) => ({
    // The Redux slice typed this as a bare string while ReduxState claimed ForecastModes.
    forecastMode: ForecastModes.TEMPERATURE,
    setForecastMode: (forecastMode: ForecastModes) => set({ forecastMode }),
}));
