import { SearchCity, SearchCityListSchema } from "@/features/city/types/search-city";
import { openWeatherApi } from "@/lib/api-client";

// The query goes through searchParams, so it is URL-encoded for us; the old hand-built URL needed
// an explicit encodeURIComponent and would otherwise have broken on a city name containing "&".
export async function searchCities(
    query: string,
    options: { signal?: AbortSignal } = {}
): Promise<SearchCity[]> {
    const payload = await openWeatherApi
        .get("geo/1.0/direct", { searchParams: { q: query, limit: 3 }, signal: options.signal })
        .json();

    return SearchCityListSchema.parse(payload);
}
