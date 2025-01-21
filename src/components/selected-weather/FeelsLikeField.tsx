import React from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "../../types/State";

function FeelsLikeField() {
    const selectedFeelsLike: number = useSelector(
        (state: ReduxState) => state.selectedWeather.selectedFeelsLike
    );
    const temperatureInF: boolean = useSelector((state: ReduxState) => state.settings.temperatureInF);

    const getFeelsLikeValue = (temperatureInF: boolean): string | undefined => {
        if (temperatureInF === false) {
            return selectedFeelsLike.toFixed(0);
        } else if (temperatureInF == true) {
            return (selectedFeelsLike * (9 / 5) + 32).toFixed(0);
        } else {
            return "0";
        }
    };

    return (
        <p className="feels-like">
            {`Feels like: ${getFeelsLikeValue(temperatureInF)}`}
            <span className="degree">°</span>
        </p>
    );
}

export default React.memo(FeelsLikeField);
