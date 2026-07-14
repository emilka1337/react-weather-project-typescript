import { create } from "zustand";

import { SearchCity } from "@/features/city/types/search-city";
import { readJson, writeJson } from "@/utils/storage";

const STORAGE_KEY = "starredCities";

const loadStarredCities = (): SearchCity[] => readJson<SearchCity[]>(STORAGE_KEY) ?? [];

const saveStarredCities = (starredCities: SearchCity[]): void => writeJson(STORAGE_KEY, starredCities);

interface StarredCitiesStore {
    starredCities: SearchCity[];
    addCityToStarredCities: (city: SearchCity) => void;
    removeCityFromStarredCities: (index: number) => void;
}

export const useStarredCitiesStore = create<StarredCitiesStore>((set, get) => {
    const update = (starredCities: SearchCity[]): void => {
        set({ starredCities });
        saveStarredCities(starredCities);
    };

    return {
        starredCities: loadStarredCities(),

        addCityToStarredCities: (city: SearchCity) => update([...get().starredCities, city]),

        removeCityFromStarredCities: (index: number) =>
            update(get().starredCities.filter((_city, cityIndex) => cityIndex !== index)),
    };
});
