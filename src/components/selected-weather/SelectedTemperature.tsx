import React, { useCallback } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { useSelectedWeatherStore } from "../../store/selectedWeatherStore";

function SelectedTemperature() {
    const temperature: number = useSelectedWeatherStore(
        (state) => state.selectedWeather.selectedTemperature
    );
    const temperatureInF: boolean = useSettingsStore((state) => state.settings.temperatureInF);

    const getSelectedTemperatureValue = useCallback(
        (temperatureInF: boolean): string | undefined => {
            if (temperatureInF === false) {
                return temperature.toFixed(0);
            } else if (temperatureInF == true) {
                return (temperature * (9 / 5) + 32).toFixed(0);
            }
        },
        [temperatureInF, temperature]
    );

    return (
        <h1 className="selected-temperature">
            {getSelectedTemperatureValue(temperatureInF)}
            <span className="degree">°</span>
        </h1>
    );
}

export default React.memo(SelectedTemperature);
