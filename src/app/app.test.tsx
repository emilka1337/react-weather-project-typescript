import { render, screen, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useSettingsStore } from "@/stores/settings-store";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const WAIT = { timeout: 3000 };
const COORDS = { latitude: BAKU.lat, longitude: BAKU.lon } as GeolocationCoordinates;

const mockGeolocation = (coords: GeolocationCoordinates | null): void => {
    vi.stubGlobal("navigator", {
        ...navigator,
        geolocation: {
            getCurrentPosition: (success: PositionCallback, failure: PositionErrorCallback) => {
                if (coords) success({ coords, timestamp: 0 } as GeolocationPosition);
                else failure({ code: 1, message: "denied" } as GeolocationPositionError);
            },
        },
    });
};

// Smoke: the whole app, mounted for real, over MSW. server.listen({ onUnhandledRequest: "error" })
// means any request the app makes that nobody declared fails the test.
describe("App (smoke)", () => {
    it("renders the whole widget on the happy path, without logging a single error", async () => {
        const consoleError = vi.spyOn(console, "error");
        mockGeolocation(COORDS);

        const { container } = render(<App />);

        // City name, from reverse geocoding.
        expect(await screen.findByText("Baku", {}, WAIT)).toBeInTheDocument();
        // Selected temperature, from the forecast. The fixture's first slot is 20 C.
        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("20"),
            WAIT
        );
        // The day strip, and the clock.
        expect(container.querySelectorAll("li.forecast-day").length).toBeGreaterThan(0);
        expect(container.querySelector(".clocks")).toBeInTheDocument();

        // Nothing went wrong quietly along the way.
        expect(consoleError).not.toHaveBeenCalled();
    });

    it("falls back to IP geolocation when the browser denies permission", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {}); // the denial is logged on purpose
        mockGeolocation(null);

        const { container } = render(<App />);

        // ipapi.co answers with Baku's coordinates, so the app still ends up with a forecast.
        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("20"),
            WAIT
        );
    });

    it("shows the loader, and asks for no forecast, while the browser never answers", async () => {
        let forecastRequests = 0;
        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                forecastRequests += 1;
                return HttpResponse.json({ city: {}, cnt: 0, cod: "200", list: [] });
            })
        );
        vi.stubGlobal("navigator", {
            ...navigator,
            geolocation: { getCurrentPosition: () => undefined },
        });

        const { container } = render(<App />);

        await waitFor(() => expect(container.querySelector(".loading")).toBeInTheDocument(), WAIT);
        expect(forecastRequests).toBe(0);
    });

    it("applies dark mode to the root element", async () => {
        mockGeolocation(COORDS);

        const { container } = render(<App />);
        expect(container.querySelector(".app.dark")).toBeNull();

        act(() => useSettingsStore.getState().toggleDarkMode());

        await waitFor(() => expect(container.querySelector(".app.dark")).not.toBeNull(), WAIT);
    });
});
