import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCity } from "../../store/selectedCitySlice";
import EditCityToggler from "./EditCityToggler";
import ky from "ky";

const CitySearch = React.lazy(() => import("./CitySearch"));

const saveCityName = (cityName: string) =>
    localStorage.setItem("last-saved-city-name", JSON.stringify(cityName));

const loadLastSavedCityName = (): string => {
    const lastSavedCity: string | null = localStorage.getItem("last-saved-city-name");
    if (lastSavedCity) {
        return JSON.parse(lastSavedCity)
    } else {
        throw new Error("Failed to load last saved city name")
    }
}

function City() {
    const [showCitySearch, setShowCitySearch] = useState(false);
    const geolocation = useSelector((state) => state.geolocation);
    const cityName = useSelector((state) => state.selectedCity);

    const dispatch = useDispatch();

    useEffect(() => {
        fetchCityNameByCoords(geolocation.lat, geolocation.lon);
    }, [geolocation.lat, geolocation.lon]);

    const focusOnCitySearch = () => {
        setShowCitySearch(!showCitySearch);
    };

    const fetchCityNameByCoords = async (lat: number, lon: number) => {
        if (!lat || !lon) return;

        const requestURL = `${
            import.meta.env.VITE_BASE_URL
        }geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${
            import.meta.env.VITE_API_KEY
        }`;

        ky.get(requestURL)
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
    };

    return (
        <div className="city">
            <h3 className="city-name">{cityName}</h3>
            <EditCityToggler onClick={focusOnCitySearch} />
            <CitySearch showCitySearch={showCitySearch} />
        </div>
    );
}

export default React.memo(City);
