// The `city` object inside the forecast payload. Named ForecastCity, not City, to keep it clearly
// distinct from SearchCity, which is what the geocoding endpoints return.
export interface ForecastCity {
    readonly coord: {
        lat: number;
        lon: number;
    };
    readonly country: string;
    readonly id: number;
    readonly name: string;
    readonly population: number;
    readonly sunrise: number;
    readonly sunset: number;
    readonly timezone: number;
}
