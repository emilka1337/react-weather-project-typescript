import { createSlice } from "@reduxjs/toolkit";
import { Settings } from "../types/Settings";

let localSavedSettings: Settings | string | null = localStorage.getItem("weather-app-settings");
let parsedSettings: Settings | undefined;

if (localSavedSettings) {
    parsedSettings = JSON.parse(localSavedSettings);
}

const initialState: Settings = parsedSettings ?? {
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false,
    showFeelsLikeField: false,
    temperatureInF: false,
    speedUnitInMS: false,
    showSecondsInClocks: false,
    showNotifications: false,
}

const settingsSlice = createSlice({
    name: "settings",
    initialState: initialState,
    reducers: {
        toggleDarkMode(state: Settings): void {
            state.darkMode = !state.darkMode;
        },
        toggleFeelsLikeField(state: Settings): void {
            state.showFeelsLikeField = !state.showFeelsLikeField;
        },
        toggleTemperatureScale(state: Settings): void {
            state.temperatureInF = !state.temperatureInF;
        },
        toggleSpeedUnit(state: Settings): void {
            state.speedUnitInMS = !state.speedUnitInMS;
        },
        toggleSecondsInClocks(state: Settings): void {
            state.showSecondsInClocks = !state.showSecondsInClocks;
        },
        toggleNotifications(state: Settings): void {
            state.showNotifications = !state.showNotifications;
        },
        resetSettings(state: Settings): void {
            state.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false;
            state.showFeelsLikeField = false;
            state.temperatureInF = false;
            state.speedUnitInMS = false;
            state.showSecondsInClocks = false;
            state.showNotifications = false;
        }
    }
})


export const { toggleDarkMode, toggleFeelsLikeField, toggleTemperatureScale, toggleSpeedUnit, toggleSecondsInClocks, resetSettings, toggleNotifications } = settingsSlice.actions
export default settingsSlice.reducer