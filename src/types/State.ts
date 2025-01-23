import { ForecastModes } from "../enums/ForecastMode"
import { Alert } from "./Alert";
import { CityGeolocation } from "./CityGeolocation";
import { ForecastData } from "./ForecastData";
import { ForecastUnit } from "./ForecastUnit";
import { SearchedCity } from "./SearchedCity";
import { SelectedWeather } from "./SelectedWeather";
import { Settings } from "./Settings";

export interface ReduxState {
    forecastMode: ForecastModes
    forecast: ForecastUnit[]
    selectedWeather: SelectedWeather
    geolocation: CityGeolocation
    selectedCity: string
    starredCities: SearchedCity[]
    alerts: {
        errors: Alert[]
        warnings: Alert[]
    }
    settings: Settings
}