import { useCallback, useEffect } from "react";
// Components
import Topbar from "@/app/components/topbar";
import DailyForecast from "@/features/weather/components/daily-forecast";
import SelectedWeather from "@/features/weather/components/selected-weather";
import SettingsMenu from "@/features/settings/components/settings-menu";
// Hooks
import useGeolocation from "@/hooks/use-geolocation";
import useNotificationPermission from "@/hooks/use-notification-permission";
import useTomorrowForecastNotification from "@/features/weather/hooks/use-tomorrow-forecast-notification";
// Stores
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSettingsStore } from "@/stores/settings-store";
import { fetchForecast } from "@/features/weather/api/get-forecast";
// Types
import { ForecastData } from "@/features/weather/types/forecast-data";
import { CityGeolocation } from "@/types/geolocation";

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
    const showNotification = useTomorrowForecastNotification();

    useEffect(() => {
        if (forecast.length > 0) {
            showNotification();
        }
    }, [forecast, showNotification]);

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
