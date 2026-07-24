import React, { useEffect } from "react";

import Loading from "@/components/ui/spinner/spinner";
import FeelsLikeField from "@/features/weather/components/feels-like-field";
import MoreWeatherInfo from "@/features/weather/components/more-weather-info";
import SelectedTemperature from "@/features/weather/components/selected-temperature";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { useSettingsStore } from "@/stores/settings-store";

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
