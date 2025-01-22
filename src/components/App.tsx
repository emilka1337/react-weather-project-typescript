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
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";
import { Dispatch } from "@reduxjs/toolkit";

const Settings = React.lazy(() => import("./settings/Settings"));

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
    const dispatch = useDispatch();
    const darkMode: boolean = useSelector((state: ReduxState) => state.settings.darkMode);
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const cityName: string = useSelector((state: ReduxState) => state.selectedCity);

    // Defines user geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                );
            },
            (error: GeolocationPositionError) => {
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
            const savedForecastData: ForecastData | null = getSavedForecastData();
            const currentMilliseconds: number = Date.now();

            if (
                savedForecastData === null ||
                (savedForecastData.timeStamp &&
                    currentMilliseconds - savedForecastData.timeStamp > 300 * 1000) ||
                savedForecastData.city.name != cityName
            ) {
                const data: Promise<ForecastData> = dispatch(fetchForecast({ lat, lon }));
                data.then((data: ForecastData) => {
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
