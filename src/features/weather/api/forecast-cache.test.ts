import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FORECAST_TTL_MS, readUsableForecast, saveForecast } from "@/features/weather/api/forecast-cache";
import { ForecastData } from "@/features/weather/types/forecast-data";
import { makeForecast } from "@/testing/fixtures/forecast";

const BAKU = { lat: 40.37, lon: 49.89 };
const GANJA = { lat: 40.68, lon: 46.36 };

const forecastData = {
    city: { name: "Baku", coord: BAKU },
    cnt: 40,
    cod: "200",
    list: makeForecast(),
} as ForecastData;

describe("forecast cache", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => vi.useRealTimers());

    it("returns nothing when nothing was ever saved", () => {
        expect(readUsableForecast(BAKU)).toBeNull();
    });

    it("returns the saved forecast for the same coordinates, inside the TTL", () => {
        saveForecast(forecastData, BAKU);

        vi.advanceTimersByTime(FORECAST_TTL_MS - 1);

        expect(readUsableForecast(BAKU)?.list).toHaveLength(40);
    });

    it("expires once the TTL has passed", () => {
        saveForecast(forecastData, BAKU);

        vi.advanceTimersByTime(FORECAST_TTL_MS + 1);

        expect(readUsableForecast(BAKU)).toBeNull();
    });

    // The whole point of keying on coordinates: a fresh forecast for Baku must not be served for Ganja.
    it("does not serve a forecast fetched for different coordinates", () => {
        saveForecast(forecastData, BAKU);

        expect(readUsableForecast(GANJA)).toBeNull();
    });

    it("does not leave our envelope fields on the API payload itself", () => {
        saveForecast(forecastData, BAKU);

        expect(forecastData).not.toHaveProperty("timeStamp");
        expect(forecastData).not.toHaveProperty("geolocation");
    });

    it("survives a corrupted entry", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        localStorage.setItem("forecastData", "{not json");

        expect(readUsableForecast(BAKU)).toBeNull();
    });
});
