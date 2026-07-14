
import { City } from "@/features/weather/types/forecast-city";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { CityGeolocation } from "@/types/geolocation";

export interface ForecastData {
    readonly city: City;
    readonly cnt: number;
    readonly cod: string;
    readonly list: ForecastUnit[];
    // Stamped by us at save time, not returned by the API.
    timeStamp?: number;
    geolocation?: CityGeolocation;
}
