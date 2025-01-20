import { ForecastModes } from "../enums/ForecastMode"
import { Alert } from "./Alert";
import { CityGeolocation } from "./CityGeolocation";
import { ForecastData } from "./ForecastData";
import { SearchedCity } from "./SearchedCity";
import { SelectedWeather } from "./SelectedWeather";
import { Settings } from "./Settings";

export interface ReduxState {
    forecastMode: ForecastModes
    forecast: ForecastData
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