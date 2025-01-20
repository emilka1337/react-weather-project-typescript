import { createSlice } from "@reduxjs/toolkit";

const initialState = JSON.parse(localStorage.getItem("weather-app-settings")) ?? {
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false,
    showFeelsLikeField: false,
    temperatureInF: false,
    speedUnitInMS: false,
    showSecondsInClocks: false,
}

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        ...initialState
    },
    reducers: {
        toggleDarkMode(state, action) {
            state.darkMode = !state.darkMode;
        },
        toggleFeelsLikeField(state, action) {
            state.showFeelsLikeField = !state.showFeelsLikeField;
        },
        toggleTemperatureScale(state, action) {
            state.temperatureInF = !state.temperatureInF;
        },
        toggleSpeedUnit(state, action) {
            state.speedUnitInMS = !state.speedUnitInMS;
        },
        toggleSecondsInClocks(state, action) {
            state.showSecondsInClocks = !state.showSecondsInClocks;
        },
        resetSettings(state, action) {
            state.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false;
            state.showFeelsLikeField = false;
            state.temperatureInF = false;
            state.speedUnitInMS = false;
            state.showSecondsInClocks = false;
        }
    }
})


export const { toggleDarkMode, toggleFeelsLikeField, toggleTemperatureScale, toggleSpeedUnit, toggleSecondsInClocks, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer