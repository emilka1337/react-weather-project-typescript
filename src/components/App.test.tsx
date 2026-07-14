import { render, screen, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { useSettingsStore } from "@/store/settingsStore";
import { makeForecast } from "@/testing/fixtures/forecast";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const COORDS = { latitude: BAKU.lat, longitude: BAKU.lon } as GeolocationCoordinates;

const mockGeolocation = (coords: GeolocationCoordinates | null): void => {
    vi.stubGlobal("navigator", {
        ...navigator,
        geolocation: {
            getCurrentPosition: (success: PositionCallback) => {
                if (coords) success({ coords, timestamp: 0 } as GeolocationPosition);
            },
        },
    });
};

// Counts the forecast requests that actually leave through ky, rather than counting calls to a
// mocked module. That is the whole point of using MSW here: the URL, the query string and the
// response parsing all run for real.
const countForecastRequests = (): { count: () => number } => {
    let count = 0;

    server.use(
        http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
            count += 1;

            return HttpResponse.json({
                city: { name: "Baku", country: "AZ", coord: BAKU },
                cnt: 40,
                cod: "200",
                list: makeForecast(),
            });
        })
    );

    return { count: () => count };
};

describe("App", () => {
    beforeEach(() => {
        useSettingsStore.setState((state) => ({
            settings: { ...state.settings, darkMode: false, temperatureInF: false },
        }));
    });

    // City renders the lazy CitySearch with no Suspense boundary above it, so the whole tree stays
    // suspended until that chunk resolves. Nothing renders synchronously — hence waitFor.
    it("shows the loader and requests no forecast while the browser never answers", async () => {
        const forecast = countForecastRequests();
        mockGeolocation(null);

        const { container } = render(<App />);

        await waitFor(() => expect(container.querySelector(".loading")).not.toBeNull());
        expect(forecast.count()).toBe(0);
    });

    it("drives geolocation -> forecast request -> store -> rendered temperature", async () => {
        const forecast = countForecastRequests();
        mockGeolocation(COORDS);

        const { container } = render(<App />);

        // 20 is the first unit's temp in the fixture.
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")).toHaveTextContent("20")
        );
        expect(await screen.findByText("Baku")).toBeInTheDocument();
        expect(forecast.count()).toBe(1);
    });

    it("serves a second mount from the localStorage cache instead of refetching", async () => {
        const forecast = countForecastRequests();
        mockGeolocation(COORDS);

        const first = render(<App />);
        await waitFor(() => expect(forecast.count()).toBe(1));
        first.unmount();

        const { container } = render(<App />);

        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")).toHaveTextContent("20")
        );
        expect(forecast.count()).toBe(1); // cache hit: no second request
    });

    it("reflects a settings toggle in the rendered output", async () => {
        countForecastRequests();
        mockGeolocation(COORDS);

        const { container } = render(<App />);
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")).toHaveTextContent("20")
        );

        act(() => useSettingsStore.getState().toggleTemperatureScale());

        // 20 C -> 68 F
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")).toHaveTextContent("68")
        );
    });

    it("applies dark mode from the settings store to the root class", async () => {
        countForecastRequests();
        mockGeolocation(null);

        const { container } = render(<App />);
        expect(container.querySelector(".app.dark")).toBeNull();

        act(() => useSettingsStore.getState().toggleDarkMode());

        await waitFor(() => expect(container.querySelector(".app.dark")).not.toBeNull());
    });
});
