import React, { Suspense, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWeather } from "../../store/selectedWeatherSlice";
import TemperatureContainer from "./TemperatureContainer";
import { ForecastUnit } from "../../types/ForecastUnit";
import { Time } from "../../types/Time";
import { ForecastModes } from "../../enums/ForecastMode";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";

const WindContainer = React.lazy(() => import("./WindContainer"));

interface ForecastCellProps {
    cellForecast: ForecastUnit;
    timestamp: number;
    isDefaultActive: boolean;
}

function formatTime(time: Time): string {
    let hours = time.hours;
    let minutes = time.minutes;

    if (typeof hours === "number" && hours < 10) {
        hours = "0" + hours;
    }
    if (typeof minutes === "number" && minutes < 10) {
        minutes = "0" + minutes;
    }

    return `${hours}:${minutes}`;
}

function ForecastCell({ cellForecast, timestamp, isDefaultActive }: ForecastCellProps) {
    const forecastMode: ForecastModes = useSelector((state: ReduxState) => state.forecastMode);

    const dispatch: AppDispatch = useDispatch();
    const activeIndicator = useRef<HTMLDivElement | null>(null);

    const date: Date = new Date(timestamp * 1000);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    const formattedTime: string = formatTime({ hours, minutes });

    const clickHandler = (): void => {
        document
            .querySelectorAll(".active-indicator")
            .forEach((item: Element) => item.classList.remove("show"));
        if (activeIndicator.current) {
            activeIndicator.current.classList.add("show");
        }
        dispatch(setSelectedWeather(cellForecast));
    };

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
            <div
                ref={activeIndicator}
                className={isDefaultActive ? "active-indicator show" : "active-indicator"}
            ></div>
        </div>
    );
}

export default React.memo(ForecastCell);
