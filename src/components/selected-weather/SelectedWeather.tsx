import React, { useEffect } from "react";
import Loading from "./Loading";
import SelectedTemperature from "./SelectedTemperature";
import FeelsLikeField from "./FeelsLikeField";
import MoreWeatherInfo from "./MoreWeatherInfo";
import { ForecastUnit } from "../../types/ForecastUnit";
import { useForecastStore } from "../../store/forecastStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useSelectedWeatherStore } from "../../store/selectedWeatherStore";

function SelectedWeather() {
    const showFeelsLikeField: boolean = useSettingsStore(
        (state) => state.settings.showFeelsLikeField
    );
    const forecast: ForecastUnit[] = useForecastStore((state) => state.forecast);
    const setSelectedWeather = useSelectedWeatherStore((state) => state.setSelectedWeather);

    // Setting main displaying weather to current weather
    useEffect(() => {
        if (forecast[0]) {
            setSelectedWeather(forecast[0]);
        }
    }, [forecast, setSelectedWeather]);

    if (forecast.length > 0) {
        return (
            <div className="selected-weather">
                <SelectedTemperature />
                {showFeelsLikeField && <FeelsLikeField />}
                <MoreWeatherInfo />
            </div>
        );
    } else {
        return <Loading />;
    }
}

export default React.memo(SelectedWeather);
