import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCity } from "../../store/selectedCitySlice";
import { setGeolocation } from "../../store/geolocationSlice";
import { removeCityFromStarredCities } from "../../store/starredCitiesSlice";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";
import { SearchCity } from "../../types/SearchCity";

function StarredCitiesList() {
    const starredCities: SearchCity[] = useSelector((state: ReduxState) => state.starredCities);
    const dispatch: AppDispatch = useDispatch();

    const handleCityClick = useCallback((city: SearchCity): void => {
        dispatch(setSelectedCity(city.name));
        dispatch(setGeolocation({ lat: city.lat, lon: city.lon }));
    }, [])

    const removeFromFavorites = useCallback((index: number): void => {
        dispatch(removeCityFromStarredCities(index));
    }, [])

    return (
        <ul className="cities-list starred-cities-list">
            {starredCities.length > 0 && <h5>Starred</h5>}
            {starredCities.map((city, index) => {
                return (
                    <li key={index}>
                        <button className="set-city" onClick={() => handleCityClick(city)}>
                            {city.name}, {city.country}
                        </button>
                        <button onClick={() => removeFromFavorites(index)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                className="bi bi-star-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export default React.memo(StarredCitiesList);
