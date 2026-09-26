import { ForecastData, ForecastSchema } from "@/features/weather/types/forecast-data";
import { openWeatherApi } from "@/lib/api-client";
import { CityGeolocation } from "@/types/geolocation";

// Validated at the boundary: a malformed/unexpected payload throws a ZodError here (which the caller
// catches) instead of surfacing as a crash deep in rendering. searchParams must be a plain object -
// see the note in lib/api-client.ts about the appid merge.
export async function getForecast({ lat, lon }: CityGeolocation): Promise<ForecastData> {
    const payload = await openWeatherApi
        .get("data/2.5/forecast", { searchParams: { lat, lon, units: "metric" } })
        .json();

    return ForecastSchema.parse(payload);
}
