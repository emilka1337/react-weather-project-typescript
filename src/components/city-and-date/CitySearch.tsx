import React, { useEffect, useState } from "react";
import SearchedCitiesList from "./SearchedCitiesList";
import StarredCitiesList from "./StarredCitiesList";
import ky from "ky";
import { SearchCity } from "../../types/SearchCity";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../types/State";
import { setShowCitySearchMenu } from "../../store/citySearchMenuSlice";

function CitySearch() {
    const [inputValue, setInputValue] = useState<string>("");
    const [citiesList, setCitiesList] = useState<SearchCity[]>([]);

    const showCitySearch = useSelector((state: ReduxState) => state.showCitySearchMenu);
    const dispatch = useDispatch();

    const handleInputChange = (e: React.BaseSyntheticEvent) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        const timeoutID: number = setTimeout((): void => {
            if (inputValue) {
                const requestURL: string = `${
                    import.meta.env.VITE_BASE_URL
                }geo/1.0/direct?q=${inputValue}&limit=3&appid=${import.meta.env.VITE_API_KEY}`;

                ky.get<SearchCity[]>(requestURL)
                    .json()
                    .then((data: SearchCity[]) => {
                        setCitiesList(data);
                    });
            } else {
                setCitiesList([]);
            }
        }, 500);

        return () => clearTimeout(timeoutID);
    }, [inputValue]);

    return (
        <section className={showCitySearch ? "city-search show" : "city-search"}>
            <div className="close-container">
                <button onClick={() => dispatch(setShowCitySearchMenu(false))}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16"
                    >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                </button>
            </div>
            <input type="text" placeholder="Search city..." value={inputValue} onChange={handleInputChange} />
            <StarredCitiesList />
            <SearchedCitiesList citiesList={citiesList} />
        </section>
    );
}

export default React.memo(CitySearch);
