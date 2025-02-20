import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCity } from "../../store/selectedCitySlice";
import { setGeolocation } from "../../store/geolocationSlice";
import { addCityToStarredCities } from "../../store/starredCitiesSlice";
import { AppDispatch } from "../../store/store";
import { SearchCity } from "../../types/SearchCity";
import { ReduxState } from "../../types/State";

interface SearchedCitiesListProps {
    readonly citiesList: SearchCity[];
}

function SearchedCitiesList({ citiesList }: SearchedCitiesListProps) {
    const dispatch: AppDispatch = useDispatch();
    const StarredCitiesList: SearchCity[] = useSelector((state: ReduxState) => state.starredCities);

    const handleCityClick = useCallback((city: SearchCity): void => {
        dispatch(setSelectedCity(city.name));
        dispatch(setGeolocation({ lat: city.lat, lon: city.lon }));
    }, []);

    const addToFavorites = useCallback((city: SearchCity) => {
        const cityAlreadyStarred: boolean = StarredCitiesList.some(
            (starredCity: SearchCity) => city.name === starredCity.name
        );

        if (!cityAlreadyStarred) {
            dispatch(addCityToStarredCities(city));
        }
    }, []);

    return (
        <ul className="cities-list">
            {citiesList.length > 0 && <h5>Search</h5>}
            {citiesList.map((city, index) => {
                return (
                    <li key={index}>
                        <button className="set-city" onClick={() => handleCityClick(city)}>
                            {city.name}, {city.country}
                        </button>
                        <button onClick={() => addToFavorites(city)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                className="bi bi-star"
                                viewBox="0 0 16 16"
                            >
                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                            </svg>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export default React.memo(SearchedCitiesList);
