import React, { useEffect, useState } from "react";
import SearchedCitiesList from "./SearchedCitiesList";
import StarredCitiesList from "./StarredCitiesList";
import ky from "ky";
import { SearchCity } from "../../types/SearchCity";

interface CitySearchProps {
    readonly showCitySearch: boolean;
}

function CitySearch({ showCitySearch }: CitySearchProps) {
    const [inputValue, setInputValue] = useState<string>("");
    const [citiesList, setCitiesList] = useState<SearchCity[]>([]);

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
            <input type="text" placeholder="Search city..." value={inputValue} onChange={handleInputChange} />
            <StarredCitiesList />
            <SearchedCitiesList citiesList={citiesList} />
        </section>
    );
}

export default React.memo(CitySearch);
