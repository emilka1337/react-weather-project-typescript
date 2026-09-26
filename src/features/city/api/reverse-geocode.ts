import { SearchCity, SearchCityListSchema } from "@/features/city/types/search-city";
import { openWeatherApi } from "@/lib/api-client";
import { CityGeolocation } from "@/types/geolocation";

export async function reverseGeocode({ lat, lon }: CityGeolocation): Promise<SearchCity[]> {
    const payload = await openWeatherApi
        .get("geo/1.0/reverse", { searchParams: { lat, lon, limit: 5 } })
        .json();

    return SearchCityListSchema.parse(payload);
}

// A 200 with an empty array is a valid answer (coordinates over the ocean, say). The caller wants
// a name or an error, not an empty array it has to remember to check.
export async function getCityNameByCoords(geolocation: CityGeolocation): Promise<string> {
    const [city] = await reverseGeocode(geolocation);

    if (!city) {
        throw new Error(`No city found for coordinates ${geolocation.lat}, ${geolocation.lon}`);
    }

    return city.name;
}
