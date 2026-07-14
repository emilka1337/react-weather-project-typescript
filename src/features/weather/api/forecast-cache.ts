import { ForecastData } from "@/features/weather/types/forecast-data";
import { CityGeolocation } from "@/types/geolocation";
import { readJson, writeJson } from "@/utils/storage";

const STORAGE_KEY = "forecastData";

export const FORECAST_TTL_MS = 300 * 1000;

// Our envelope around the API payload, rather than fields bolted onto ForecastData itself.
interface CachedForecast {
    readonly data: ForecastData;
    readonly timeStamp: number;
    readonly geolocation: CityGeolocation;
}

export function saveForecast(data: ForecastData, geolocation: CityGeolocation): void {
    writeJson(STORAGE_KEY, { data, timeStamp: Date.now(), geolocation } satisfies CachedForecast);
}

// Keyed on the coordinates the forecast was fetched for, not on the city name: the name arrives
// asynchronously from reverse geocoding and is still "Loading" on the first render, so comparing
// against it never matched and the cache was dead.
export function readUsableForecast(geolocation: CityGeolocation): ForecastData | null {
    const cached = readJson<CachedForecast>(STORAGE_KEY);

    if (!cached?.timeStamp || !cached.geolocation || !cached.data) return null;
    if (Date.now() - cached.timeStamp > FORECAST_TTL_MS) return null;

    const sameLocation =
        cached.geolocation.lat === geolocation.lat && cached.geolocation.lon === geolocation.lon;

    return sameLocation ? cached.data : null;
}
