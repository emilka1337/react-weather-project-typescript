
import { City } from "./City";
import { ForecastUnit } from "../types/ForecastUnit";

export interface ForecastData {
    readonly city: City;
    readonly cnt: number;
    readonly cod: string;
    readonly list: ForecastUnit[];
    timeStamp?: number;
}