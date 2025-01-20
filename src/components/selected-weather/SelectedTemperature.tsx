import React from "react";
import { useSelector } from "react-redux";

function SelectedTemperature() {
    const temperature: number = useSelector((state) => state.selectedWeather.selectedTemperature);
    const temperatureInF: boolean = useSelector((state) => state.settings.temperatureInF);

    const getSelectedTemperatureValue = (): string => {
        if (temperatureInF === false) {
            return temperature.toFixed(0);
        } else if (temperatureInF == true) {
            return (temperature * (9 / 5) + 32).toFixed(0);
        } else {
            return "0";
        }
    };

    return (
        <h1 className="selected-temperature">
            {getSelectedTemperatureValue()}
            <span className="degree">°</span>
        </h1>
    );
}

export default React.memo(SelectedTemperature);
