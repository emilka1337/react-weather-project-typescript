import React, { Suspense, useCallback, useMemo, useRef } from "react";

import TemperatureContainer from "@/features/weather/components/temperature-container";
import { useForecastModeStore } from "@/features/weather/stores/forecast-mode-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { ForecastModes } from "@/features/weather/types/forecast-mode";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { formatTime } from "@/utils/format-time";

const WindContainer = React.lazy(() => import("@/features/weather/components/wind-container"));
const HumidityContainer = React.lazy(() => import("@/features/weather/components/humidity-container"));

interface ForecastCellProps {
    readonly cellForecast: ForecastUnit;
    readonly timestamp: number;
    readonly isDefaultActive: boolean;
}

function ForecastCell({ cellForecast, timestamp, isDefaultActive }: ForecastCellProps) {
    const forecastMode: ForecastModes = useForecastModeStore((state) => state.forecastMode);
    const setSelectedWeather = useSelectedWeatherStore((state) => state.setSelectedWeather);

    const activeIndicator = useRef<HTMLDivElement | null>(null);

    const formattedTime: string = useMemo(() => {
        const date = new Date(timestamp * 1000);

        return formatTime({ hours: date.getHours(), minutes: date.getMinutes() });
    }, [timestamp]);

    const clickHandler = useCallback((): void => {
        document
            .querySelectorAll(".active-indicator")
            .forEach((item: Element) => item.classList.remove("show"));
        if (activeIndicator.current) {
            activeIndicator.current.classList.add("show");
        }
        setSelectedWeather(cellForecast);
    }, [setSelectedWeather, cellForecast])

    return (
        <div className="forecast-cell" onClick={clickHandler}>
            <h4 className="time">{`${formattedTime}`}</h4>
            {forecastMode === ForecastModes.TEMPERATURE && (
                <TemperatureContainer
                    temperature={cellForecast.main.temp}
                    main={cellForecast.weather[0].main}
                />
            )}
            <Suspense>
                {forecastMode == ForecastModes.WIND && (
                    <WindContainer speed={cellForecast.wind.speed} degree={cellForecast.wind.deg} />
                )}
            </Suspense>
            <Suspense>
                {forecastMode == ForecastModes.HUMIDITY && (
                    <HumidityContainer humidity={cellForecast.main.humidity} />
                )}
            </Suspense>
            <div
                ref={activeIndicator}
                className={isDefaultActive ? "active-indicator show" : "active-indicator"}
            ></div>
        </div>
    );
}

export default React.memo(ForecastCell);
