import { useEffect } from "react";

import { readUsableForecast, saveForecast } from "@/features/weather/api/forecast-cache";
import { getForecast } from "@/features/weather/api/get-forecast";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { CityGeolocation } from "@/types/geolocation";

// Owns the whole forecast lifecycle for a set of coordinates: cache lookup, request, cache write,
// store update. This used to live in app.tsx, which made the shell responsible for a feature's
// data layer.
export default function useForecast(geolocation: CityGeolocation): void {
    const setForecast = useForecastStore((state) => state.setForecast);

    useEffect(() => {
        if (!geolocation.lat || !geolocation.lon) return;

        const cached = readUsableForecast(geolocation);

        if (cached) {
            setForecast(cached.list);
            return;
        }

        let cancelled = false;

        getForecast(geolocation)
            .then((forecast) => {
                if (cancelled) return;

                saveForecast(forecast, geolocation);
                setForecast(forecast.list);
            })
            .catch((error: unknown) => {
                console.error("Failed to fetch forecast: ", error);
            });

        return () => {
            cancelled = true;
        };
    }, [geolocation, setForecast]);
}
