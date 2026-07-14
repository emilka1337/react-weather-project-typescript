import React, { useEffect, useCallback } from "react";
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

const loadLastSavedCityName = (): string | undefined => {
    const lastSavedCity: string | null = localStorage.getItem("last-saved-city-name");
    if (!lastSavedCity) return undefined;

    // Runs inside the recovery path below, so it must not throw on a corrupted value.
    try {
        return JSON.parse(lastSavedCity);
    } catch {
        localStorage.removeItem("last-saved-city-name");
        return undefined;
    }
};

function City() {
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const showCitySearch = useSelector((state: ReduxState) => state.showCitySearchMenu);
    const cityName: string = useSelector((state: ReduxState) => state.selectedCity);

    const dispatch: AppDispatch = useDispatch();

    const focusOnCitySearch = (): void => {
        dispatch(setShowCitySearchMenu(!showCitySearch));
    };

    const fetchCityNameByCoords = useCallback(
        async (lat: number, lon: number): Promise<void> => {
            if (!lat || !lon) return;

            const requestURL = `${
                import.meta.env.VITE_BASE_URL
            }geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${import.meta.env.VITE_API_KEY}`;

            try {
                const res = await ky.get<SearchCity[]>(requestURL);
                const data = await res.json();

                // A 200 with an empty array is a valid answer (e.g. coordinates over the ocean).
                if (!data[0]) throw new Error(`No city found for coordinates ${lat}, ${lon}`);

                saveCityName(data[0].name);
                dispatch(setSelectedCity(data[0].name));
            } catch (error) {
                console.error("Failed to resolve city name by coordinates: ", error);
                dispatch(setSelectedCity(loadLastSavedCityName() ?? "Sorry, something went wrong :("));
            }
        },
        [dispatch]
    );

    useEffect(() => {
        fetchCityNameByCoords(geolocation.lat, geolocation.lon);
    }, [geolocation.lat, geolocation.lon, fetchCityNameByCoords]);

    return (
        <div className="city">
            <h3 className="city-name">{cityName}</h3>
            <EditCityToggler onClick={focusOnCitySearch} />
            <CitySearch />
        </div>
    );
}

export default React.memo(City);
