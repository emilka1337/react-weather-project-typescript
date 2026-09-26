import ForecastDay from "@/features/weather/components/forecast-day";
import ForecastModeTogglePanel from "@/features/weather/components/forecast-mode-toggle-panel";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import type { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { separateListByWeekdays } from "@/features/weather/utils/separate-list-by-weekdays";

function DailyForecast() {
    const forecast: ForecastUnit[] = useForecastStore((state) => state.forecast);

    // Derived during render, not mirrored into state by an effect (which rendered once with a stale
    // list, then again). React Compiler memoizes it on `forecast`.
    const separatedForecastList = separateListByWeekdays(forecast);

    if (separatedForecastList.length === 0) return null;

    return (
        <>
            <ForecastModeTogglePanel />
            <ul className="daily-forecast">
                {separatedForecastList.map((day: readonly ForecastUnit[]) => (
                    // ?? rather than ||: Sunday is weekday 0, which is falsy, so `||` silently
                    // relabelled every Sunday column with today's weekday. Key on the day's first
                    // timestamp - stable identity, not the array index.
                    <ForecastDay day={day} weekday={day[0].weekday ?? new Date().getDay()} key={day[0].dt} />
                ))}
            </ul>
        </>
    );
}

export default DailyForecast;
