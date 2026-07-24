import React, { useMemo } from "react";

import ForecastCell from "@/features/weather/components/forecast-cell";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";

interface ForecastDayProps {
    readonly day: readonly ForecastUnit[];
    readonly weekday: number;
}

function ForecastDay({day, weekday}: ForecastDayProps) {
    const WEEKDAYS = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

    return (
        <li className="forecast-day">
            <div className="weekday">
                <h4>{WEEKDAYS[weekday]}</h4>
            </div>

            {day.map((item: ForecastUnit) => (
                <ForecastCell timestamp={item.dt} cellForecast={item} key={item.dt} />
            ))}
        </li>
    );
}

export default React.memo(ForecastDay);
