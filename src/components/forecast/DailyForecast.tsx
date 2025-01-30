import React, { useEffect, useState } from "react";
import ForecastDay from "./ForecastDay";
import ForecastModeTogglePanel from "./ForecastModeTogglePanel";
import { useSelector } from "react-redux";
import { ForecastUnit } from "../../types/ForecastUnit";
import { ReduxState } from "../../types/State";

function extractWeekDayFromTimestamp(ts: number): number {
    return new Date(ts * 1000).getDay();
}

function countElementsInArrayOfArrays(arr: Array<Array<unknown>>): number {
    let result = 0;

    for (const elem of arr) {
        result += elem.length;
    }

    return result;
}

export function separateListByWeekdays(list: ForecastUnit[]): Array<Array<ForecastUnit>> | [] {
    if (!list.length) return [];

    const newList: ForecastUnit[] = structuredClone(list);
    newList.map((item: ForecastUnit) => (item.weekday = extractWeekDayFromTimestamp(item.dt)));

    const result: Array<Array<ForecastUnit>> = [];

    let currentWeekday: number | undefined = newList[0].weekday;

    while (countElementsInArrayOfArrays(result) < 40) {
        result.push(newList.filter((item) => item.weekday == currentWeekday));

        if (currentWeekday && currentWeekday < 6) {
            currentWeekday++;
        } else {
            currentWeekday = 0;
        }
    }

    return result;
}

function DailyForecast() {
    const [separatedForecastList, setseparatedForecastList] = useState<ReadonlyArray<ReadonlyArray<ForecastUnit>>>([]);

    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);

    useEffect(() => {
        if (forecast.length > 0) {
            setseparatedForecastList(separateListByWeekdays(forecast));
        }
    }, [forecast]);

    if (separatedForecastList.length > 0) {
        return (
            <>
                <ForecastModeTogglePanel />
                <ul className="daily-forecast">
                    {separatedForecastList.map((day: readonly ForecastUnit[], index: number) => {
                        return <ForecastDay day={day} weekday={day[0].weekday || new Date().getDay()} key={index} />;
                    })}
                </ul>
            </>
        );
    }
}

export default React.memo(DailyForecast);
