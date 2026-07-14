import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import App from "./App";
import { makeForecast } from "../test/forecastFixture";
import { useForecastStore } from "../store/forecastStore";
import { useGeolocationStore } from "../store/geolocationStore";
import { useSettingsStore } from "../store/settingsStore";
import { fetchForecast } from "../api/fetchForecast";

const BAKU = { latitude: 40.37, longitude: 49.89 };

vi.mock("../api/fetchForecast", () => ({ fetchForecast: vi.fn() }));

// City resolves the city name through ky; keep it off the network.
vi.mock("ky", () => ({
    default: {
        get: vi.fn(async () => ({ json: async () => [{ name: "Baku", country: "AZ" }] })),
    },
}));

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

describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks(); // call counts must not leak between tests
        localStorage.clear();
        useForecastStore.setState({ forecast: [] });
        useGeolocationStore.setState({ geolocation: { lat: 0, lon: 0 } });
        useSettingsStore.setState((state) => ({
            settings: { ...state.settings, darkMode: false, temperatureInF: false },
        }));
        vi.mocked(fetchForecast).mockResolvedValue({
            city: { name: "Baku", coord: { lat: BAKU.latitude, lon: BAKU.longitude } },
            cnt: 40,
            cod: "200",
            list: makeForecast(),
        } as never);
    });

    // City renders the lazy CitySearch with no Suspense boundary above it, so the whole tree
    // stays suspended until that chunk resolves. Nothing renders synchronously — hence waitFor.
    it("renders without a Provider and shows the loader until a forecast arrives", async () => {
        mockGeolocation(null); // browser never answers, so no forecast is ever requested

        const { container } = render(<App />);

        await waitFor(() => expect(container.querySelector(".loading")).not.toBeNull());
        expect(fetchForecast).not.toHaveBeenCalled();
    });

    it("drives geolocation -> forecast fetch -> store -> rendered temperature", async () => {
        mockGeolocation(BAKU as GeolocationCoordinates);

        const { container } = render(<App />);

        await waitFor(() =>
            expect(fetchForecast).toHaveBeenCalledWith({ lat: BAKU.latitude, lon: BAKU.longitude })
        );

        // 20 is the first unit's temp in the fixture.
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")?.textContent).toContain("20")
        );
        expect(await screen.findByText("Baku")).toBeDefined();
        expect(useForecastStore.getState().forecast).toHaveLength(40);
    });

    it("serves a second mount from the localStorage cache instead of refetching", async () => {
        mockGeolocation(BAKU as GeolocationCoordinates);

        const first = render(<App />);
        await waitFor(() => expect(fetchForecast).toHaveBeenCalledTimes(1));
        first.unmount();

        useForecastStore.setState({ forecast: [] });
        useGeolocationStore.setState({ geolocation: { lat: 0, lon: 0 } });

        const { container } = render(<App />);

        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")?.textContent).toContain("20")
        );
        expect(fetchForecast).toHaveBeenCalledTimes(1); // cache hit: no second request
    });

    it("reflects a settings toggle in the rendered output", async () => {
        mockGeolocation(BAKU as GeolocationCoordinates);

        const { container } = render(<App />);
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")?.textContent).toContain("20")
        );

        act(() => useSettingsStore.getState().toggleTemperatureScale());

        // 20 C -> 68 F
        await waitFor(() =>
            expect(container.querySelector(".selected-temperature")?.textContent).toContain("68")
        );
    });

    it("applies dark mode from the settings store to the root class", async () => {
        mockGeolocation(null);

        const { container } = render(<App />);
        expect(container.querySelector(".app.dark")).toBeNull();

        act(() => useSettingsStore.getState().toggleDarkMode());

        await waitFor(() => expect(container.querySelector(".app.dark")).not.toBeNull());
    });
});
