
import { City } from "./City";
import { ForecastUnit } from "../types/ForecastUnit";

export interface ForecastData {
    city: City;
    cnt: number;
    cod: string;
    list: ForecastUnit[];
    timeStamp?: number;
}