
import { City } from "./City";
import { ForecastUnit } from "../types/ForecastUnit";
import { CityGeolocation } from "./CityGeolocation";

export interface ForecastData {
    readonly city: City;
    readonly cnt: number;
    readonly cod: string;
    readonly list: ForecastUnit[];
    // Stamped by us at save time, not returned by the API.
    timeStamp?: number;
    geolocation?: CityGeolocation;
}
