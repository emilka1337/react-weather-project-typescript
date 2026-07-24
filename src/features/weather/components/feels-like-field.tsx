import React from "react";

import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { formatTemperature } from "@/features/weather/utils/units";
import { useSettingsStore } from "@/stores/settings-store";

function FeelsLikeField() {
    const selectedFeelsLike: number = useSelectedWeatherStore(
        (state) => state.selectedWeather.selectedFeelsLike
    );
    const temperatureInF: boolean = useSettingsStore((state) => state.settings.temperatureInF);

    return (
        <p className="feels-like">
            {`Feels like: ${formatTemperature(selectedFeelsLike, temperatureInF)}`}
            <span className="degree">°</span>
        </p>
    );
}

export default React.memo(FeelsLikeField);
