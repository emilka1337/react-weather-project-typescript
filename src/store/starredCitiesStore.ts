import { create } from "zustand";
import { SearchCity } from "../types/SearchCity";

const STORAGE_KEY = "starredCities";

function loadStarredCities(): SearchCity[] {
    const savedCities: string | null = localStorage.getItem(STORAGE_KEY);

    if (savedCities === null) return [];

    try {
        return JSON.parse(savedCities);
    } catch (error) {
        console.error("Saved starred cities are corrupted, dropping them: ", error);
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}

const saveStarredCities = (starredCities: SearchCity[]): void =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starredCities));

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
