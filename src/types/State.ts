import { ForecastModes } from "../enums/ForecastMode"
import { Alert } from "./Alert";
import { CityGeolocation } from "./CityGeolocation";
import { ForecastUnit } from "./ForecastUnit";
import { SearchCity } from "./SearchCity";
import { SelectedWeather } from "./SelectedWeather";
import { Settings } from "./Settings";

export interface ReduxState {
    forecastMode: ForecastModes
    forecast: ForecastUnit[]
    selectedWeather: SelectedWeather
    geolocation: CityGeolocation
    selectedCity: string
    starredCities: SearchCity[]
    alerts: {
        errors: Alert[]
        warnings: Alert[]
    }
    settings: Settings
}