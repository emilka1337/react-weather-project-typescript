import React from "react";
import ForecastCell from "./ForecastCell";
import { ForecastUnit } from "../../types/ForecastUnit";

interface ForecastDayProps {
    readonly day: readonly ForecastUnit[];
    readonly weekday: number;
}

function ForecastDay({day, weekday}: ForecastDayProps) {
    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <li className="forecast-day">
            <div className="weekday">
                <h4>{WEEKDAYS[weekday]}</h4>
            </div>

            {day.map((item: ForecastUnit, index: number) => {
                const isDefaultActive = index == 0 && index == 0;

                return (
                    <ForecastCell
                        timestamp={item.dt}
                        cellForecast={item}
                        isDefaultActive={isDefaultActive}
                        key={item.dt}
                    />
                );
            })}
        </li>
    );
}

export default React.memo(ForecastDay);
