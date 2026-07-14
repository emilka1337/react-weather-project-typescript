import { create } from "zustand";
import { CityGeolocation } from "../types/CityGeolocation";

interface GeolocationStore {
    geolocation: CityGeolocation;
    setGeolocation: (geolocation: CityGeolocation) => void;
}

export const useGeolocationStore = create<GeolocationStore>((set) => ({
    geolocation: { lat: 0, lon: 0 },

    // Guard carried over from the Redux slice: an incomplete fix must not overwrite a good one.
    setGeolocation: (geolocation: CityGeolocation) => {
        if (!geolocation.lat || !geolocation.lon) return;

        set({ geolocation });
    },
}));
