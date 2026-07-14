import React, { useCallback } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";

function FeelsLikeField() {
    const selectedFeelsLike: number = useSelectedWeatherStore(
        (state) => state.selectedWeather.selectedFeelsLike
    );
    const temperatureInF: boolean = useSettingsStore((state) => state.settings.temperatureInF);

    const getFeelsLikeValue = useCallback((temperatureInF: boolean): string | undefined => {
        if (temperatureInF === false) {
            return selectedFeelsLike.toFixed(0);
        } else if (temperatureInF == true) {
            return (selectedFeelsLike * (9 / 5) + 32).toFixed(0);
        } else {
            return "0";
        }
    }, [selectedFeelsLike])

    return (
        <p className="feels-like">
            {`Feels like: ${getFeelsLikeValue(temperatureInF)}`}
            <span className="degree">°</span>
        </p>
    );
}

export default React.memo(FeelsLikeField);
