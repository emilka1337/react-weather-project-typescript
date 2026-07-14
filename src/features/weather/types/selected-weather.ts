// Not readonly: these are mutated as an immer draft inside selectedWeatherSlice reducers.
export interface SelectedWeather {
    selectedWeather: number
    selectedTemperature: number
    selectedFeelsLike: number
    selectedWind: number
    selectedHumidity: number
    selectedMain: string
}
