import React, { useEffect, useState } from "react";
import SearchedCitiesList from "./SearchedCitiesList";
import StarredCitiesList from "./StarredCitiesList";
import ky from "ky";
import { SearchCity } from "../../types/SearchCity";
import { useCitySearchMenuStore } from "../../store/citySearchMenuStore";

function CitySearch() {
    const [inputValue, setInputValue] = useState<string>("");
    const [citiesList, setCitiesList] = useState<SearchCity[]>([]);

    const showCitySearch = useCitySearchMenuStore((state) => state.showCitySearchMenu);
    const setShowCitySearchMenu = useCitySearchMenuStore((state) => state.setShowCitySearchMenu);

    const handleInputChange = (e: React.BaseSyntheticEvent) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        if (!inputValue) {
            setCitiesList([]);
            return;
        }

        // clearTimeout alone only cancels a timer that has not fired yet. Once the request is
        // in flight it must be aborted too, otherwise a slow earlier response can land last
        // and overwrite the results of a newer query.
        const controller = new AbortController();

        const timeoutID = setTimeout(async (): Promise<void> => {
            const requestURL: string = `${
                import.meta.env.VITE_BASE_URL
            }geo/1.0/direct?q=${encodeURIComponent(inputValue)}&limit=3&appid=${
                import.meta.env.VITE_API_KEY
            }`;

            try {
                const res = await ky.get<SearchCity[]>(requestURL, { signal: controller.signal });
                setCitiesList(await res.json());
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("City search failed: ", error);
            }
        }, 500);

        return () => {
            clearTimeout(timeoutID);
            controller.abort();
        };
    }, [inputValue]);

    return (
        <section className={showCitySearch ? "city-search show" : "city-search"}>
            <div className="close-container">
                <button onClick={() => setShowCitySearchMenu(false)}>
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
