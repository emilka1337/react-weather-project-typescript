import { ForecastUnit } from "@/features/weather/types/forecast-unit";

const weekdayOf = (unit: ForecastUnit): number => new Date(unit.dt * 1000).getDay();

// Groups the flat forecast list into one bucket per weekday, in chronological order.
//
// The previous version looped `while (countElementsInArrayOfArrays(result) < 40)`, pushing a bucket
// per iteration. On any list shorter than 40 units the sum could never reach 40, so it pushed empty
// arrays until the tab died. OpenWeather does not guarantee 40 units, so that was a live hang.
// A Map keyed by weekday terminates on any input, cannot produce an empty bucket, and needs no
// magic count: Map preserves insertion order and the API returns the list chronologically.
export function separateListByWeekdays(list: readonly ForecastUnit[]): ForecastUnit[][] {
    const days = new Map<number, ForecastUnit[]>();

    for (const unit of list) {
        const weekday = weekdayOf(unit);
        const stamped: ForecastUnit = { ...unit, weekday };
        const day = days.get(weekday);

        if (day) day.push(stamped);
        else days.set(weekday, [stamped]);
    }

    return [...days.values()];
}
