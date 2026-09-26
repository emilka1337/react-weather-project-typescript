import { lazy, Suspense } from "react";

import TemperatureContainer from "@/features/weather/components/temperature-container";
import { useForecastModeStore } from "@/features/weather/stores/forecast-mode-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { ForecastModes } from "@/features/weather/types/forecast-mode";
import type { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { formatTime } from "@/utils/format-time";

const WindContainer = lazy(() => import("@/features/weather/components/wind-container"));
const HumidityContainer = lazy(() => import("@/features/weather/components/humidity-container"));

interface ForecastCellProps {
    readonly cellForecast: ForecastUnit;
    readonly timestamp: number;
}

function ForecastCell({ cellForecast, timestamp }: ForecastCellProps) {
    const forecastMode: ForecastModes = useForecastModeStore((state) => state.forecastMode);
    const setSelectedWeather = useSelectedWeatherStore((state) => state.setSelectedWeather);
    // Derived from state, not tracked by hand: this used to be a ref plus a
    // document.querySelectorAll(".active-indicator") sweep on every click.
    const isActive = useSelectedWeatherStore((state) => state.selectedTimestamp === cellForecast.dt);

    const date = new Date(timestamp * 1000);
    const formattedTime: string = formatTime({ hours: date.getHours(), minutes: date.getMinutes() });

    const clickHandler = (): void => {
        setSelectedWeather(cellForecast);
    };

    return (
        <button
            type="button"
            className="forecast-cell"
            aria-pressed={isActive}
            aria-label={`Forecast at ${formattedTime}`}
            onClick={clickHandler}
        >
            <h4 className="time">{formattedTime}</h4>
            {forecastMode === ForecastModes.TEMPERATURE && (
                <TemperatureContainer
                    temperature={cellForecast.main.temp}
                    main={cellForecast.weather[0].main}
                />
            )}
            <Suspense>
                {forecastMode === ForecastModes.WIND && (
                    <WindContainer speed={cellForecast.wind.speed} degree={cellForecast.wind.deg} />
                )}
            </Suspense>
            <Suspense>
                {forecastMode === ForecastModes.HUMIDITY && (
                    <HumidityContainer humidity={cellForecast.main.humidity} />
                )}
            </Suspense>
            <div className={isActive ? "active-indicator show" : "active-indicator"}></div>
        </button>
    );
}

export default ForecastCell;
