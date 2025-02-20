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

function isSavedForecastDataExpired(savedForecastData: ForecastData | null): boolean {
    const currentMilliseconds: number = Date.now();

    if (savedForecastData && savedForecastData.timeStamp) {
        return currentMilliseconds - savedForecastData.timeStamp > 300 * 1000;
    } else return true;
}

function App() {
    const dispatch: AppDispatch = useDispatch();
    const showSettings: boolean = useSelector((state: ReduxState) => state.settings.showSettings);
    const darkMode: boolean = useSelector((state: ReduxState) => state.settings.darkMode);
    const cityName: string = useSelector((state: ReduxState) => state.selectedCity);
    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);
    const geolocation: CityGeolocation = useGeolocation(); // Defines user geolocation
    useNotificationPermission();
    const showNotification = useDesktopNotification();
    // Defines user geolocation
    useGeolocation();

    useEffect(() => {
        if (forecast.length > 0) {
            showNotification();
        }
    }, [forecast]);

    // Fetching forecast after defining user geolocation
    useEffect(() => {
        getForecast(geolocation);
    }, [geolocation]);

    const getForecast = useCallback((geolocation: CityGeolocation): void => {
        if (!geolocation.lat || !geolocation.lon) return;
        try {
            const savedForecastData: ForecastData | null = getSavedForecastData();

            if (
                savedForecastData === null ||
                isSavedForecastDataExpired(savedForecastData) ||
                savedForecastData.city.name != cityName
            ) {
                dispatch(fetchForecast(geolocation))
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
            console.error("getForecast error: ", error);
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
