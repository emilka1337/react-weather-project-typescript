import React, { Suspense, useCallback, useMemo, useRef } from "react";
import TemperatureContainer from "./TemperatureContainer";
import { ForecastUnit } from "../../types/ForecastUnit";
import { Time } from "../../types/Time";
import { ForecastModes } from "../../enums/ForecastMode";
import { useForecastModeStore } from "../../store/forecastModeStore";
import { useSelectedWeatherStore } from "../../store/selectedWeatherStore";

const WindContainer = React.lazy(() => import("./WindContainer"));
const HumidityContainer = React.lazy(() => import("./HumidityContainer"));

interface ForecastCellProps {
    readonly cellForecast: ForecastUnit;
    readonly timestamp: number;
    readonly isDefaultActive: boolean;
}

function formatTime(time: Time<number>): string {
    const hours = time.hours;
    const minutes = time.minutes;

    const result: Time<string | number> = {
        hours: time.hours,
        minutes: time.minutes,
    };

    if (typeof hours === "number" && hours < 10) {
        result.hours = "0" + hours;
    }
    if (typeof minutes === "number" && minutes < 10) {
        result.minutes = "0" + minutes;
    }

    return `${result.hours}:${result.minutes}`;
}

function ForecastCell({ cellForecast, timestamp, isDefaultActive }: ForecastCellProps) {
    const forecastMode: ForecastModes = useForecastModeStore((state) => state.forecastMode);
    const setSelectedWeather = useSelectedWeatherStore((state) => state.setSelectedWeather);

    const activeIndicator = useRef<HTMLDivElement | null>(null);

    const date: Date = useMemo<Date>(() => new Date(timestamp * 1000), [timestamp]);
    const hours: number = useMemo<number>(() => date.getHours(), [date]);
    const minutes: number = useMemo<number>(() => date.getMinutes(), [date]);
    const formattedTime: string = useMemo(() => formatTime({ hours, minutes }), [hours, minutes]);

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
