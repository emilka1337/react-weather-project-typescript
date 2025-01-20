import { createSlice } from "@reduxjs/toolkit";

const selectedWeatherSlice = createSlice({
    name: "selectedWeather",
    initialState: {
        selectedWeather: 0,
        selectedTemperature: 0,
        selectedFeelsLike: 0,
        selectedWind: 0,
        selectedHumidity: 0,
        selectedMain: ""
    },
    reducers: {
        setSelectedTemperature: (state, action) => { state.selectedTemperature = action.payload.main.temp },
        setSelectedFeelsLike: (state, action) => { state.selectedFeelsLike = action.payload.main.feels_like },
        setSelectedWind: (state, action) => { state.selectedWind = action.payload.wind.speed },
        setSelectedHumidity: (state, action) => { state.selectedHumidity = action.payload.main.humidity },
        setSelectedMain: (state, action) => { state.selectedMain = action.payload.weather[0].main },
        setSelectedWeather: (state, action) => { 
            // state.selectedWeather = action.payload 
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