import React from "react";

import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { formatTemperature } from "@/features/weather/utils/units";
import { useSettingsStore } from "@/stores/settings-store";

function SelectedTemperature() {
    const temperature: number = useSelectedWeatherStore(
        (state) => state.selectedWeather.selectedTemperature
    );
    const temperatureInF: boolean = useSettingsStore((state) => state.settings.temperatureInF);

    return (
        <h1 className="selected-temperature">
            {formatTemperature(temperature, temperatureInF)}
            <span className="degree">°</span>
        </h1>
    );
}

export default React.memo(SelectedTemperature);
