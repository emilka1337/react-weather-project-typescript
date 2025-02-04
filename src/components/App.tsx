import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Components
import Topbar from "./city-and-date/Topbar";
import DailyForecast from "./forecast/DailyForecast";
import SelectedWeather from "./selected-weather/SelectedWeather";
import { setForecast } from "../store/forecastSlice";
import { fetchForecast } from "../store/forecastThunk";
import { ForecastData } from "../types/ForecastData";
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";
import { AppDispatch } from "../store/store";
import useNotificationPermission from "../hooks/useNotificationPermission";
import useTomorrowForecastNotification from "../hooks/useTomorrowForecastNotification";
import { ForecastUnit } from "../types/ForecastUnit";
import useGeolocation from "../hooks/useGeolocation";
import SettingsMenu from "./settings/SettingsMenu";

function saveForecastData(data: ForecastData): void {
    const date = new Date();
    data.timeStamp = +date;
    localStorage.setItem("forecastData", JSON.stringify(data));
}

function getSavedForecastData(): ForecastData | null {
    const forecastData: string | null = localStorage.getItem("forecastData");

    if (typeof forecastData === "string") {
        return JSON.parse(forecastData);
    } else {
        return null;
    }
}

function App() {
    const dispatch: AppDispatch = useDispatch();
    const showSettings: boolean = useSelector((state: ReduxState) => state.settings.showSettings);
    const darkMode: boolean = useSelector((state: ReduxState) => state.settings.darkMode);
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const cityName: string = useSelector((state: ReduxState) => state.selectedCity);
    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);
    useNotificationPermission();
    const showNotification = useTomorrowForecastNotification();
    // Defines user geolocation
    useGeolocation();

    useEffect(() => {
        if (forecast.length > 0) {
            showNotification();
        }
    }, [forecast]);

    // Fetching forecast after defining user geolocation
    useEffect(() => {
        if (geolocation.lat !== 0 && geolocation.lon !== 0) {
            getForecast(geolocation.lat, geolocation.lon);
        }
        // eslint-disable-next-line +react-hooks/exhaustive-deps
    }, [geolocation]);

    const getForecast = useCallback((lat: number, lon: number): void => {
        try {
            const savedForecastData: ForecastData | null = getSavedForecastData();
            const currentMilliseconds: number = Date.now();

            if (
                savedForecastData === null ||
                (savedForecastData.timeStamp &&
                    currentMilliseconds - savedForecastData?.timeStamp > 300 * 1000) ||
                savedForecastData.city.name != cityName
            ) {
                dispatch(fetchForecast({ lat, lon }))
                    .unwrap()
                    .then((forecastData: ForecastData) => {
                        saveForecastData(forecastData);
                        dispatch(setForecast(forecastData.list));
                    })
                    .catch((error) => {
                        console.error("Failed to fetch forecast:", error);
                    });
            } else {
                dispatch(setForecast(savedForecastData));
            }
        } catch (error) {
            console.log("getForecast error: ", error);
            setForecast(getSavedForecastData());
        }
    }, []);

    return (
        <div className={darkMode ? "app dark" : "app"}>
            <div className="widget">
                <Topbar />
                <SelectedWeather />
                <DailyForecast />
                <SettingsMenu showSettings={showSettings} />
            </div>
        </div>
    );
}

export default App;
