import { create } from "zustand";

import { CityGeolocation } from "@/types/geolocation";

interface GeolocationStore {
    geolocation: CityGeolocation;
    setGeolocation: (geolocation: CityGeolocation) => void;
}

export const useGeolocationStore = create<GeolocationStore>((set, get) => ({
    geolocation: { lat: 0, lon: 0 },

    setGeolocation: ({ lat, lon }: CityGeolocation) => {
        // An incomplete fix must not overwrite a good one.
        if (!lat || !lon) return;

        const current = get().geolocation;

        // Same coordinates, same object. Storing a fresh object for an unchanged position changes
        // the reference, which re-runs every effect keyed on it - and useForecast, re-running while
        // its own request is still in flight, would fire a second identical request.
        if (current.lat === lat && current.lon === lon) return;

        set({ geolocation: { lat, lon } });
    },
}));
