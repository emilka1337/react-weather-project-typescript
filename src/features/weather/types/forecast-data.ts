import { ForecastCity } from "@/features/weather/types/forecast-city";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";

// The API shape, and nothing else. The cache's own timeStamp/geolocation fields used to live here,
// which is what made app.tsx mutate the response object before storing it. They belong to the
// cache envelope in features/weather/api/forecast-cache.ts, not to the contract with OpenWeather.
export interface ForecastData {
    readonly city: ForecastCity;
    readonly cnt: number;
    readonly cod: string;
    readonly list: ForecastUnit[];
}
