import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import City from "@/features/city/components/city";
import { useSelectedCityStore } from "@/features/city/stores/selected-city-store";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { useUiStore } from "@/stores/ui-store";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/geo/1.0/reverse";
const BAKU = { lat: 40.37, lon: 49.89 };

const seedCoords = (): void => {
    act(() => useGeolocationStore.getState().setGeolocation(BAKU));
};

describe("City", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("shows the placeholder name and requests nothing before coordinates arrive", () => {
        render(<City />);

        expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("renders synchronously now that the lazy CitySearch is behind a Suspense boundary", () => {
        // Before the boundary existed, the lazy chunk suspended the whole tree and this rendered
        // nothing at all.
        const { container } = render(<City />);

        expect(container.querySelector(".city-name")).toBeInTheDocument();
    });

    it("resolves the city name from the coordinates", async () => {
        seedCoords();

        render(<City />);

        expect(await screen.findByText("Baku")).toBeInTheDocument();
        expect(useSelectedCityStore.getState().selectedCity).toBe("Baku");
    });

    it("remembers the resolved name for next time", async () => {
        seedCoords();

        render(<City />);

        await screen.findByText("Baku");
        expect(localStorage.getItem("last-saved-city-name")).toBe('"Baku"');
    });

    it("falls back to the last saved name when the lookup fails", async () => {
        localStorage.setItem("last-saved-city-name", '"Ganja"');
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));
        seedCoords();

        render(<City />);

        expect(await screen.findByText("Ganja")).toBeInTheDocument();
    });

    it("says so when the lookup fails and nothing was ever saved", async () => {
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));
        seedCoords();

        render(<City />);

        expect(await screen.findByText("Sorry, something went wrong :(")).toBeInTheDocument();
    });

    // A 200 with an empty array is a valid answer: coordinates over the ocean.
    it("treats an empty result as a failure rather than rendering an empty name", async () => {
        localStorage.setItem("last-saved-city-name", '"Ganja"');
        server.use(http.get(ENDPOINT, () => HttpResponse.json([])));
        seedCoords();

        render(<City />);

        expect(await screen.findByText("Ganja")).toBeInTheDocument();
    });

    it("opens the city search from the edit button", async () => {
        const user = userEvent.setup();
        const { container } = render(<City />);

        await user.click(container.querySelector(".edit-city-toggler")!);

        await waitFor(() => expect(useUiStore.getState().activePanel).toBe("city-search"));
    });
});
