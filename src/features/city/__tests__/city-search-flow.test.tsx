import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useSelectedCityStore } from "@/features/city/stores/selected-city-store";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { useUiStore } from "@/stores/ui-store";
import { makeForecast } from "@/testing/fixtures/forecast";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const GANJA = { lat: 40.68, lon: 46.36 };
const WAIT = { timeout: 3000 };

// The browser answers with Baku, so the app starts there.
const mockGeolocation = (): void => {
    vi.stubGlobal("navigator", {
        ...navigator,
        geolocation: {
            getCurrentPosition: (success: PositionCallback) =>
                success({
                    coords: { latitude: BAKU.lat, longitude: BAKU.lon },
                    timestamp: 0,
                } as GeolocationPosition),
        },
    });
};

describe("city search flow", () => {
    beforeEach(mockGeolocation);

    // This is the test the whole decoupling rests on. `city` and `weather` never import each other:
    // picking a city writes coordinates into the shared geolocation store, and `weather` reacts.
    it("searching and picking a city moves the forecast to that city's coordinates", async () => {
        const forecastCoords: string[] = [];

        server.use(
            http.get("https://api.openweathermap.org/geo/1.0/direct", () =>
                HttpResponse.json([
                    { name: "Ganja", country: "AZ", lat: GANJA.lat, lon: GANJA.lon, local_names: {} },
                ])
            ),
            // Reverse geocoding answers for whichever coordinates it is given: once the city is
            // picked, this is what re-labels the header.
            http.get("https://api.openweathermap.org/geo/1.0/reverse", ({ request }) => {
                const lat = new URL(request.url).searchParams.get("lat");
                const name = lat === String(GANJA.lat) ? "Ganja" : "Baku";

                return HttpResponse.json([{ name, country: "AZ", local_names: {} }]);
            }),
            http.get("https://api.openweathermap.org/data/2.5/forecast", ({ request }) => {
                const params = new URL(request.url).searchParams;
                forecastCoords.push(`${params.get("lat")},${params.get("lon")}`);

                return HttpResponse.json({
                    city: { name: "x", coord: BAKU },
                    cnt: 40,
                    cod: "200",
                    list: makeForecast(),
                });
            })
        );

        const user = userEvent.setup();
        render(<App />);

        // The forecast for the browser's coordinates lands first.
        await waitFor(() => expect(forecastCoords).toEqual(["40.37,49.89"]), WAIT);

        await user.click(document.querySelector(".edit-city-toggler")!);
        await user.type(await screen.findByPlaceholderText("Search city...", {}, WAIT), "Ganja");
        await user.click(await screen.findByText("Ganja, AZ", {}, WAIT));

        // Picking the city updated the shared store...
        expect(useGeolocationStore.getState().geolocation).toEqual(GANJA);
        await waitFor(() => expect(useSelectedCityStore.getState().selectedCity).toBe("Ganja"), WAIT);

        // ...and the weather feature, which has never heard of the city feature, refetched for it.
        await waitFor(
            () => expect(forecastCoords).toEqual(["40.37,49.89", "40.68,46.36"]),
            WAIT
        );
        expect(useForecastStore.getState().forecast).toHaveLength(40);
    });

    it("closing the search panel leaves the picked city in place", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(document.querySelector(".edit-city-toggler")!);
        expect(useUiStore.getState().activePanel).toBe("city-search");

        await user.click(document.querySelector(".close-container button")!);

        expect(useUiStore.getState().activePanel).toBe("none");
        expect(await screen.findByText("Baku", {}, WAIT)).toBeInTheDocument();
    });
});
