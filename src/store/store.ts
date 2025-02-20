import { configureStore } from "@reduxjs/toolkit";
import settingsSlice from "./settingsSlice";
import settingsMiddleware from "./settingsMiddleware";
import alertsSlice from "./alertsSlice";
import selectedWeatherSlice from "./selectedWeatherSlice";
import forecastModeSlice from "./forecastModeSlice";
import geolocationSlice from "./geolocationSlice";
import forecastSlice from "./forecastSlice";
import selectedCitySlice from "./selectedCitySlice";
import starredCitiesSlice from "./starredCitiesSlice";
import showCitySearchMenuSlice from "./citySearchMenuSlice";

export type AppDispatch = typeof store.dispatch;

const store = configureStore({
    reducer: {
        settings: settingsSlice,
        alerts: alertsSlice,
        selectedWeather: selectedWeatherSlice,
        forecastMode: forecastModeSlice,
        geolocation: geolocationSlice,
        forecast: forecastSlice,
        selectedCity: selectedCitySlice,
        starredCities: starredCitiesSlice,
        showCitySearchMenu: showCitySearchMenuSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsMiddleware),
})

export default store