import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Components
import Topbar from "./city-and-date/Topbar";
import DailyForecast from "./forecast/DailyForecast";
import SelectedWeather from "./selected-weather/SelectedWeather";
import SettingsMenu from "./settings/SettingsMenu";
// Hooks
import useGeolocation from "../hooks/useGeolocation";
import useNotificationPermission from "../hooks/useNotificationPermission";
import useDesktopNotification from "../hooks/useDesktopNotification";
// Redux Toolkit
import { setForecast } from "../store/forecastSlice";
import { fetchForecast } from "../store/forecastThunk";
import { AppDispatch } from "../store/store";
// Types
import { ForecastData } from "../types/ForecastData";
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";
import { ForecastUnit } from "../types/ForecastUnit";

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
    const dispatch: AppDispatch = useDispatch();
    const showSettings: boolean = useSelector((state: ReduxState) => state.settings.showSettings);
    const darkMode: boolean = useSelector((state: ReduxState) => state.settings.darkMode);
    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);
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
                dispatch(setForecast(savedForecastData.list));
                return;
            }

            dispatch(fetchForecast(geolocation))
                .unwrap()
                .then((forecastData: ForecastData) => {
                    saveForecastData(forecastData, geolocation);
                    dispatch(setForecast(forecastData.list));
                })
                .catch((error) => {
                    console.error("Failed to fetch forecast: ", error);
                });
        },
        [dispatch]
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
