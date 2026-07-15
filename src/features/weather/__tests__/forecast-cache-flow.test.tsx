import { render, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { FORECAST_TTL_MS } from "@/features/weather/api/forecast-cache";
import { makeForecast } from "@/testing/fixtures/forecast";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const WAIT = { timeout: 3000 };
const GANJA = { lat: 40.68, lon: 46.36 };

const mockGeolocation = (coords: { lat: number; lon: number }): void => {
    vi.stubGlobal("navigator", {
        ...navigator,
        geolocation: {
            getCurrentPosition: (success: PositionCallback) =>
                success({
                    coords: { latitude: coords.lat, longitude: coords.lon },
                    timestamp: 0,
                } as GeolocationPosition),
        },
    });
};

const countForecastRequests = (): (() => number) => {
    let count = 0;

    server.use(
        http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
            count += 1;

            return HttpResponse.json({
                city: { name: "Baku", coord: BAKU },
                cnt: 40,
                cod: "200",
                list: makeForecast(),
            });
        })
    );

    return () => count;
};

describe("forecast cache flow", () => {
    beforeEach(() => mockGeolocation(BAKU));

    it("a remount inside the TTL is served from the cache, with no second request", async () => {
        const requests = countForecastRequests();

        const first = render(<App />);
        await waitFor(() => expect(requests()).toBe(1), WAIT);
        first.unmount();

        const { container } = render(<App />);

        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("20"),
            WAIT
        );
        expect(requests()).toBe(1);
    });

    it("once the TTL has passed, it fetches again", async () => {
        const requests = countForecastRequests();

        const first = render(<App />);
        await waitFor(() => expect(requests()).toBe(1), WAIT);
        first.unmount();

        // Age the cached entry past its TTL, without faking timers around MSW.
        const cached = JSON.parse(localStorage.getItem("forecastData")!) as { timeStamp: number };
        cached.timeStamp -= FORECAST_TTL_MS + 1;
        localStorage.setItem("forecastData", JSON.stringify(cached));

        render(<App />);

        await waitFor(() => expect(requests()).toBe(2), WAIT);
    });

    // The cache is keyed on coordinates, not on the city name, precisely so this cannot happen.
    it("a forecast cached for one city is not served for another", async () => {
        const requests = countForecastRequests();

        const first = render(<App />);
        await waitFor(() => expect(requests()).toBe(1), WAIT);
        first.unmount();

        mockGeolocation(GANJA);
        render(<App />);

        await waitFor(() => expect(requests()).toBe(2), WAIT);
    });
});
