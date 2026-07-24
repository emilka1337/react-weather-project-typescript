import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStarredCitiesStore } from "@/features/city/stores/starred-cities-store";
import { SearchCity } from "@/features/city/types/search-city";
import { useForecastModeStore } from "@/features/weather/stores/forecast-mode-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { ForecastModes } from "@/features/weather/types/forecast-mode";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { makeForecastUnit } from "@/testing/fixtures/forecast";

const city = (name: string, lat: number, lon: number): SearchCity => ({
    name,
    country: "AZ",
    lat,
    lon,
});

const readPersistedCities = (): SearchCity[] =>
    JSON.parse(localStorage.getItem("starredCities") ?? "[]") as SearchCity[];

describe("geolocationStore", () => {
    beforeEach(() => useGeolocationStore.setState({ geolocation: { lat: 0, lon: 0 } }));

    it("stores a complete fix", () => {
        useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 });

        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 40.37, lon: 49.89 });
    });

    it("refuses an incomplete fix rather than clobbering a good one", () => {
        useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 });
        useGeolocationStore.getState().setGeolocation({ lat: 0, lon: 0 });

        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 40.37, lon: 49.89 });
    });

    it("keeps a stable object identity until it actually changes, so effects do not re-fire", () => {
        const before = useGeolocationStore.getState().geolocation;
        useGeolocationStore.getState().setGeolocation({ lat: 0, lon: 0 });

        expect(useGeolocationStore.getState().geolocation).toBe(before);
    });

    // Re-setting the SAME coordinates used to store a fresh object, which changed the reference and
    // re-ran every effect keyed on it. useForecast, re-running while its own request was still in
    // flight, then fired a second identical request.
    it("keeps the same object when the coordinates have not actually moved", () => {
        useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 });
        const before = useGeolocationStore.getState().geolocation;

        useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 });

        expect(useGeolocationStore.getState().geolocation).toBe(before);
    });

    it("replaces the object when the coordinates really do move", () => {
        useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 });
        const before = useGeolocationStore.getState().geolocation;

        useGeolocationStore.getState().setGeolocation({ lat: 40.68, lon: 46.36 });

        expect(useGeolocationStore.getState().geolocation).not.toBe(before);
        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 40.68, lon: 46.36 });
    });
});

describe("starredCitiesStore", () => {
    beforeEach(() => {
        localStorage.clear();
        useStarredCitiesStore.setState({ starredCities: [] });
    });

    it("persists an added city", () => {
        useStarredCitiesStore.getState().addCityToStarredCities(city("Baku", 40.37, 49.89));

        expect(useStarredCitiesStore.getState().starredCities).toHaveLength(1);
        expect(readPersistedCities()[0].name).toBe("Baku");
    });

    it("removes the city at the given index and persists the result", () => {
        const { addCityToStarredCities, removeCityFromStarredCities } =
            useStarredCitiesStore.getState();

        addCityToStarredCities(city("Baku", 40.37, 49.89));
        addCityToStarredCities(city("Ganja", 40.68, 46.36));
        removeCityFromStarredCities(0);

        const names = useStarredCitiesStore.getState().starredCities.map((c) => c.name);

        expect(names).toEqual(["Ganja"]);
        expect(readPersistedCities()).toHaveLength(1);
    });

    it("does not mutate the previous array, so React sees a new reference", () => {
        const before = useStarredCitiesStore.getState().starredCities;
        useStarredCitiesStore.getState().addCityToStarredCities(city("Baku", 40.37, 49.89));

        expect(useStarredCitiesStore.getState().starredCities).not.toBe(before);
        expect(before).toHaveLength(0);
    });

    it("drops corrupted saved cities instead of throwing at import", async () => {
        localStorage.setItem("starredCities", "{not json");
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.resetModules();

        const store = (await import("@/features/city/stores/starred-cities-store")).useStarredCitiesStore;

        expect(store.getState().starredCities).toEqual([]);
    });
});

describe("forecastModeStore", () => {
    it("defaults to temperature and switches mode", () => {
        expect(useForecastModeStore.getState().forecastMode).toBe(ForecastModes.TEMPERATURE);

        useForecastModeStore.getState().setForecastMode(ForecastModes.WIND);

        expect(useForecastModeStore.getState().forecastMode).toBe(ForecastModes.WIND);
    });
});

describe("selectedWeatherStore", () => {
    it("projects a forecast unit onto the selected-weather fields", () => {
        useSelectedWeatherStore.getState().setSelectedWeather(makeForecastUnit(0, 21.6));

        const { selectedWeather } = useSelectedWeatherStore.getState();

        expect(selectedWeather.selectedTemperature).toBe(21.6);
        expect(selectedWeather.selectedFeelsLike).toBe(20.6);
        expect(selectedWeather.selectedMain).toBe("Clear");
        expect(selectedWeather.selectedHumidity).toBe(40);
    });
});
