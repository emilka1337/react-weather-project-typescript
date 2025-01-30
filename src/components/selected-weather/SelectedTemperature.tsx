import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "../../types/State";

function SelectedTemperature() {
    const temperature: number = useSelector((state: ReduxState) => state.selectedWeather.selectedTemperature);
    const temperatureInF: boolean = useSelector((state: ReduxState) => state.settings.temperatureInF);

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
