import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SelectedWeather } from "../types/SelectedWeather";
import { ForecastUnit } from "../types/ForecastUnit";

const initialState: SelectedWeather = {
    selectedWeather: 0,
    selectedTemperature: 0,
    selectedFeelsLike: 0,
    selectedWind: 0,
    selectedHumidity: 0,
    selectedMain: ""
}

const selectedWeatherSlice = createSlice({
    name: "selectedWeather",
    initialState: initialState,
    reducers: {
        setSelectedTemperature: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedTemperature = action.payload.main.temp
        },
        setSelectedFeelsLike: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedFeelsLike = action.payload.main.feels_like
        },
        setSelectedWind: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedWind = action.payload.wind.speed
        },
        setSelectedHumidity: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedHumidity = action.payload.main.humidity
        },
        setSelectedMain: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedMain = action.payload.weather[0].main
        },
        setSelectedWeather: (state, action: PayloadAction<ForecastUnit>) => {
            state.selectedTemperature = action.payload.main.temp
            state.selectedFeelsLike = action.payload.main.feels_like
            state.selectedWind = action.payload.wind.speed
            state.selectedHumidity = action.payload.main.humidity
            state.selectedMain = action.payload.weather[0].main
        },
    }
})

export const { setSelectedWeather, setSelectedTemperature, setSelectedFeelsLike, setSelectedWind, setSelectedHumidity, setSelectedMain } = selectedWeatherSlice.actions
export default selectedWeatherSlice.reducer