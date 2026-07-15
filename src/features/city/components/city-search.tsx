import React, { useEffect, useRef, useState } from "react";

import { searchCities } from "@/features/city/api/search-cities";
import SearchedCitiesList from "@/features/city/components/searched-cities-list";
import StarredCitiesList from "@/features/city/components/starred-cities-list";
import { SearchCity } from "@/features/city/types/search-city";
import { useUiStore } from "@/stores/ui-store";

function CitySearch() {
    const [inputValue, setInputValue] = useState<string>("");
    const [citiesList, setCitiesList] = useState<SearchCity[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const showCitySearch = useUiStore((state) => state.activePanel === "city-search");
    const closePanel = useUiStore((state) => state.closePanel);

    // Move focus into the search box when the panel opens, so a keyboard user can type immediately
    // instead of having to tab to it.
    useEffect(() => {
        if (showCitySearch) inputRef.current?.focus();
    }, [showCitySearch]);

    // BaseSyntheticEvent made e.target an `any`, so e.target.value was unchecked.
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value);
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

        const timeoutID = setTimeout(() => {
            searchCities(inputValue, { signal: controller.signal })
                .then(setCitiesList)
                .catch((error: unknown) => {
                    if (controller.signal.aborted) return;

                    console.error("City search failed: ", error);
                });
        }, 500);

        return () => {
            clearTimeout(timeoutID);
            controller.abort();
        };
    }, [inputValue]);

    return (
        <section className={showCitySearch ? "city-search show" : "city-search"}>
            <div className="close-container">
                <button aria-label="Close city search" onClick={closePanel}>
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
            <input
                ref={inputRef}
                type="text"
                aria-label="Search city"
                placeholder="Search city..."
                value={inputValue}
                onChange={handleInputChange}
            />
            <StarredCitiesList />
            <SearchedCitiesList citiesList={citiesList} />
        </section>
    );
}

export default React.memo(CitySearch);
