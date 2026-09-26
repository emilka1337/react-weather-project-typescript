import { create } from "zustand";

import { SearchCity } from "@/features/city/types/search-city";
import { readJson, writeJson } from "@/utils/storage";

const STORAGE_KEY = "starredCities";

const loadStarredCities = (): SearchCity[] => readJson<SearchCity[]>(STORAGE_KEY) ?? [];

const saveStarredCities = (starredCities: SearchCity[]): void => writeJson(STORAGE_KEY, starredCities);

// Identity is name + coordinates, not name alone: two different cities can share a name (Paris FR vs
// Paris TX), and deduping by name would drop the second.
const sameCity = (a: SearchCity, b: SearchCity): boolean =>
    a.name === b.name && a.lat === b.lat && a.lon === b.lon;

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

        // Dedup lives here, not in the component, so every add path is covered.
        addCityToStarredCities: (city: SearchCity) => {
            const current = get().starredCities;

            if (current.some((starred) => sameCity(starred, city))) return;

            update([...current, city]);
        },

        removeCityFromStarredCities: (index: number) =>
            update(get().starredCities.filter((_city, cityIndex) => cityIndex !== index)),
    };
});
