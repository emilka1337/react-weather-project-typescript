import { ForecastUnit } from "@/features/weather/types/forecast-unit";

// OpenWeather returns 40 units (5 days x 3h). separateListByWeekdays now groups by weekday and
// terminates on any length, so the count is not load-bearing - but keeping 40 matches the real API
// and gives the day-grouping tests several distinct days to work with.
export const FORECAST_UNIT_COUNT = 40;

// Only the fields the app reads (and the schema validates). See forecast-unit.ts.
export function makeForecastUnit(index: number, temp: number): ForecastUnit {
    return {
        dt: 1_700_000_000 + index * 3 * 60 * 60,
        main: {
            temp,
            feels_like: temp - 1,
            humidity: 40 + index,
        },
        wind: { speed: 3 + index / 10, deg: 180 },
        weather: [{ main: "Clear" }],
    };
}

export const makeForecast = (): ForecastUnit[] =>
    Array.from({ length: FORECAST_UNIT_COUNT }, (_unit, index) => makeForecastUnit(index, 20 + index));
