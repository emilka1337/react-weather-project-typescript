import { create } from "zustand";

import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { SelectedWeather } from "@/features/weather/types/selected-weather";

interface SelectedWeatherStore {
    selectedWeather: SelectedWeather;
    // The dt of the forecast slot currently selected, so each cell can derive whether it is the
    // active one from state instead of the component reaching across the DOM with querySelectorAll.
    selectedTimestamp: number | null;
    setSelectedWeather: (forecastUnit: ForecastUnit) => void;
}

const initialSelectedWeather: SelectedWeather = {
    selectedWeather: 0,
    selectedTemperature: 0,
    selectedFeelsLike: 0,
    selectedWind: 0,
    selectedHumidity: 0,
    selectedMain: "",
};

export const useSelectedWeatherStore = create<SelectedWeatherStore>((set) => ({
    selectedWeather: initialSelectedWeather,
    selectedTimestamp: null,

    setSelectedWeather: (forecastUnit: ForecastUnit) =>
        set(({ selectedWeather }) => ({
            selectedTimestamp: forecastUnit.dt,
            selectedWeather: {
                ...selectedWeather,
                selectedTemperature: forecastUnit.main.temp,
                selectedFeelsLike: forecastUnit.main.feels_like,
                selectedWind: forecastUnit.wind.speed,
                selectedHumidity: forecastUnit.main.humidity,
                selectedMain: forecastUnit.weather[0].main,
            },
        })),
}));
