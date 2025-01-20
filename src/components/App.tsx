import React, { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Components
import CityAndDate from "./city-and-date/CityAndDate";
import DailyForecast from "./forecast/DailyForecast";
import SelectedWeather from "./selected-weather/SelectedWeather";
import { setGeolocation } from "../store/geolocationSlice";
import { setForecast } from "../store/forecastSlice";
import { fetchForecast } from "../store/forecastThunk";
import { ForecastData } from "../types/ForecastData";

const Settings = React.lazy(() => import("./settings/Settings"));

function saveForecastData(data: ForecastData) {
    const date = new Date();
    data.timeStamp = +date;
    localStorage.setItem("forecastData", JSON.stringify(data));
}

function getSavedForecastData() {
    const forecastData: string | null = localStorage.getItem("forecastData");

    if (typeof forecastData === "string") {
        return JSON.parse(forecastData);
    }
}

function App() {
    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.settings.darkMode);
    const geolocation = useSelector((state) => state.geolocation);
    const cityName = useSelector((state) => state.selectedCity);

    // Defines user geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                );
            },
            (error) => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // Fetching forecast after defining user geolocation
    useEffect(() => {
        if (geolocation.lat !== 0 && geolocation.lon !== 0) {
            getForecast(geolocation.lat, geolocation.lon);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geolocation]);

    function getForecast(lat: number, lon: number): void {
        try {
            const savedForecastData: ForecastData = getSavedForecastData();
            const currentMilliseconds: number = Date.now();

            if (
                !savedForecastData ||
                (savedForecastData.timeStamp &&
                    currentMilliseconds - savedForecastData.timeStamp > 300 * 1000) ||
                savedForecastData.payload.city.name != cityName
            ) {
                const data = dispatch(fetchForecast({ lat, lon }));
                data.then((data) => {
                    saveForecastData(data);
                    dispatch(setForecast(data));
                });
            } else {
                dispatch(setForecast(savedForecastData));
            }
        } catch {
            setForecast(getSavedForecastData());
        }
    }

    return (
        <div className={darkMode ? "app dark" : "app"}>
            <div className="widget">
                <div className="left">
                    <CityAndDate />
                    <SelectedWeather />
                    <DailyForecast />
                </div>
                <div className="right">
                    <Suspense>
                        <Settings />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

export default App;
