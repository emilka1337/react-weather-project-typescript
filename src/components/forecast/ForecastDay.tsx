import React from "react";
import ForecastCell from "./ForecastCell";
import { ForecastUnit } from "../../types/ForecastUnit";

interface ForecastDayProps {
    day: ForecastUnit[];
    index: number;
    weekday: number;
}

function ForecastDay(props: ForecastDayProps) {
    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <li className="forecast-day">
            <div className="weekday">
                <h4>{WEEKDAYS[props.weekday]}</h4>
            </div>

            {props.day.map((item, index) => {
                const isDefaultActive = props.index == 0 && index == 0;

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
