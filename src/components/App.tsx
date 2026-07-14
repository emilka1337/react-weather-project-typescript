import { useCallback, useEffect } from "react";
// Components
import Topbar from "./city-and-date/Topbar";
import DailyForecast from "./forecast/DailyForecast";
import SelectedWeather from "./selected-weather/SelectedWeather";
import SettingsMenu from "./settings/SettingsMenu";
// Hooks
import useGeolocation from "../hooks/useGeolocation";
import useNotificationPermission from "../hooks/useNotificationPermission";
import useDesktopNotification from "../hooks/useDesktopNotification";
// Stores
import { useForecastStore } from "../store/forecastStore";
import { useSettingsStore } from "../store/settingsStore";
import { fetchForecast } from "../api/fetchForecast";
// Types
import { ForecastData } from "../types/ForecastData";
import { CityGeolocation } from "../types/CityGeolocation";

const FORECAST_TTL_MS: number = 300 * 1000;

function saveForecastData(data: ForecastData, geolocation: CityGeolocation): void {
    data.timeStamp = Date.now();
    data.geolocation = geolocation;
    localStorage.setItem("forecastData", JSON.stringify(data));
}

function getSavedForecastData(): ForecastData | null {
    const forecastData: string | null = localStorage.getItem("forecastData");

    if (forecastData === null) return null;

    try {
        return JSON.parse(forecastData);
    } catch (error) {
        console.error("Saved forecast data is corrupted, dropping it: ", error);
        localStorage.removeItem("forecastData");
        return null;
    }
}

// The cache is keyed on the coordinates it was fetched for, not on the city name: the name
// arrives asynchronously from reverse geocoding and is still "Loading" on the first render.
function isSavedForecastDataUsable(
    savedForecastData: ForecastData | null,
    geolocation: CityGeolocation
): savedForecastData is ForecastData {
    if (!savedForecastData?.timeStamp || !savedForecastData.geolocation) return false;
    if (Date.now() - savedForecastData.timeStamp > FORECAST_TTL_MS) return false;

    return (
        savedForecastData.geolocation.lat === geolocation.lat &&
        savedForecastData.geolocation.lon === geolocation.lon
    );
}

function App() {
    const showSettings: boolean = useSettingsStore((state) => state.settings.showSettings);
    const darkMode: boolean = useSettingsStore((state) => state.settings.darkMode);
    const forecast = useForecastStore((state) => state.forecast);
    const setForecast = useForecastStore((state) => state.setForecast);
    const geolocation: CityGeolocation = useGeolocation(); // Defines user geolocation
    useNotificationPermission();
    const showNotification = useDesktopNotification();

    useEffect(() => {
        if (forecast.length > 0) {
            showNotification();
        }
    }, [forecast]);

    const getForecast = useCallback(
        (geolocation: CityGeolocation): void => {
            if (!geolocation.lat || !geolocation.lon) return;

            const savedForecastData: ForecastData | null = getSavedForecastData();

            if (isSavedForecastDataUsable(savedForecastData, geolocation)) {
                setForecast(savedForecastData.list);
                return;
            }

            fetchForecast(geolocation)
                .then((forecastData: ForecastData) => {
                    saveForecastData(forecastData, geolocation);
                    setForecast(forecastData.list);
                })
                .catch((error) => {
                    console.error("Failed to fetch forecast: ", error);
                });
        },
        [setForecast]
    );

    // Fetching forecast after defining user geolocation
    useEffect(() => {
        getForecast(geolocation);
    }, [geolocation, getForecast]);

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
