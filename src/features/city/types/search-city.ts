import { z } from "zod";

// The app reads only name/country/lat/lon. OpenWeather also sends `local_names` for some cities
// (and omits it for others) - it was previously typed as required, which was a lie; zod strips it.
export const SearchCitySchema = z.object({
    name: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
});

export const SearchCityListSchema = z.array(SearchCitySchema);

export type SearchCity = z.infer<typeof SearchCitySchema>;
