import { CommonForecastByDay } from "@/features/weather/types/common-forecast-by-day";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { separateListByWeekdays } from "@/features/weather/utils/separate-list-by-weekdays";

function summariseDay(day: readonly ForecastUnit[] | undefined): CommonForecastByDay | null {
    // Math.min(...[]) is Infinity, so an empty day must not reach the spread.
    if (!day?.length) return null;

    return {
        minTemp: Math.min(...day.map((unit) => unit.main.temp)),
        maxTemp: Math.max(...day.map((unit) => unit.main.temp)),
        maxWind: Math.max(...day.map((unit) => unit.wind.speed)),
    };
}

// Bucket [1] is the next distinct weekday after today - "tomorrow". null when the forecast doesn't
// reach that far, or is empty. Extracted from the notification hook so the background worker can
// reuse the exact same summary without pulling in React.
export function summariseTomorrow(forecast: readonly ForecastUnit[]): CommonForecastByDay | null {
    return summariseDay(separateListByWeekdays(forecast)[1]);
}
