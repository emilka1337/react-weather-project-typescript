import { ForecastData } from "@/features/weather/types/forecast-data";
import { openWeatherApi } from "@/lib/api-client";
import { CityGeolocation } from "@/types/geolocation";

// Errors propagate: the caller wants the real HTTP status, not a stub.
// searchParams must be a plain object — see the note in lib/api-client.ts about the appid merge.
export function getForecast({ lat, lon }: CityGeolocation): Promise<ForecastData> {
    return openWeatherApi
        .get("data/2.5/forecast", { searchParams: { lat, lon, units: "metric" } })
        .json<ForecastData>();
}
