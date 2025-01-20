import React, { useEffect, useState } from "react";
import SearchedCitiesList from "./SearchedCitiesList";
import StarredCitiesList from "./StarredCitiesList";
import ky from "ky";

import { SearchedCity } from "./StarredCitiesList";

interface CitySearchProps {
    showCitySearch: boolean;
}

function CitySearch({ showCitySearch }: CitySearchProps) {
    const [inputValue, setInputValue] = useState("");
    const [citiesList, setCitiesList] = useState<SearchedCity[]>([]);

    const handleInputChange = (e: React.BaseSyntheticEvent) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        const timeoutID: number = setTimeout((): void => {
            if (inputValue) {
                const requestURL = `${
                    import.meta.env.VITE_BASE_URL
                }geo/1.0/direct?q=${inputValue}&limit=3&appid=${import.meta.env.VITE_API_KEY}`;

                ky.get(requestURL)
                    .json()
                    .then((data: SearchedCity[]) => {
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
            <input type="text" placeholder="Search city..." value={inputValue} onChange={handleInputChange} />
            <StarredCitiesList />
            <SearchedCitiesList citiesList={citiesList} />
        </section>
    );
}

export default React.memo(CitySearch);
