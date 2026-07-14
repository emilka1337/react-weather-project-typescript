import { ForecastUnit } from "@/types/ForecastUnit";

// OpenWeather always returns 40 units (5 days x 3h). separateListByWeekdays loops until it has
// counted 40 of them, so a shorter fixture would spin forever — keep this at 40.
export const FORECAST_UNIT_COUNT = 40;

export function makeForecastUnit(index: number, temp: number): ForecastUnit {
    return {
        clouds: { all: 0 },
        dt: 1_700_000_000 + index * 3 * 60 * 60,
        dt_txt: `2023-11-1${Math.floor(index / 8)} 00:00:00`,
        main: {
            feels_like: temp - 1,
            grnd_level: 1000,
            humidity: 40 + index,
            pressure: 1013,
            sea_level: 1013,
            temp,
            temp_kf: 0,
            temp_max: temp,
            temp_min: temp,
        },
        pop: 0,
        sys: { pod: "d" },
        visibility: 10000,
        weather: [{ description: "clear sky", icon: "01d", id: 800, main: "Clear" }],
        wind: { deg: 180, gust: 5, speed: 3 + index / 10 },
    };
}

export const makeForecast = (): ForecastUnit[] =>
    Array.from({ length: FORECAST_UNIT_COUNT }, (_unit, index) => makeForecastUnit(index, 20 + index));
