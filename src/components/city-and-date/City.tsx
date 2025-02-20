import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCity } from "../../store/selectedCitySlice";
import EditCityToggler from "./EditCityToggler";
import ky from "ky";
import { CityGeolocation } from "../../types/CityGeolocation";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";
import { SearchCity } from "../../types/SearchCity";
import { setShowCitySearchMenu } from "../../store/citySearchMenuSlice";

const CitySearch = React.lazy(() => import("./CitySearch"));

const saveCityName = (cityName: string): void =>
    localStorage.setItem("last-saved-city-name", JSON.stringify(cityName));

const loadLastSavedCityName = (): string | void => {
    const lastSavedCity: string | null = localStorage.getItem("last-saved-city-name");
    if (lastSavedCity) {
        return JSON.parse(lastSavedCity)
    }
}

function City() {
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const showCitySearch = useSelector((state: ReduxState) => state.showCitySearchMenu);
    const cityName: string = useSelector((state: ReduxState) => state.selectedCity);

    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        fetchCityNameByCoords(geolocation.lat, geolocation.lon);
    }, [geolocation.lat, geolocation.lon]);

    const focusOnCitySearch = (): void => {
        dispatch(setShowCitySearchMenu(!showCitySearch));
    };

    const fetchCityNameByCoords = useCallback(async (lat: number, lon: number) => {
        if (!lat || !lon) return;

        const requestURL = `${
            import.meta.env.VITE_BASE_URL
        }geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${
            import.meta.env.VITE_API_KEY
        }`;

        ky.get<SearchCity[]>(requestURL)
            .json()
            .then((data) => {
                saveCityName(data[0].name);
                dispatch(setSelectedCity(data[0].name));
            })
            .catch(() => {
                const cityName: string =
                    loadLastSavedCityName() ?? "Sorry, something went wrong :(";
                dispatch(setSelectedCity(cityName));
            });
    }, [])

    return (
        <div className="city">
            <h3 className="city-name">{cityName}</h3>
            <EditCityToggler onClick={focusOnCitySearch} />
            <CitySearch />
        </div>
    );
}

export default React.memo(City);
