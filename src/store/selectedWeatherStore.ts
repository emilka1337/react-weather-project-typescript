import { create } from "zustand";
import { SelectedWeather } from "../types/SelectedWeather";
import { ForecastUnit } from "../types/ForecastUnit";

interface SelectedWeatherStore {
    selectedWeather: SelectedWeather;
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

    setSelectedWeather: (forecastUnit: ForecastUnit) =>
        set(({ selectedWeather }) => ({
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
