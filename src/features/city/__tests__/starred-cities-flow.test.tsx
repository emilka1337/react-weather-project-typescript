import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import CitySearch from "@/features/city/components/city-search";
import { useStarredCitiesStore } from "@/features/city/stores/starred-cities-store";
import { server } from "@/testing/mocks/server";

const WAIT = { timeout: 3000 };

const searchReturns = (name: string): void => {
    server.use(
        http.get("https://api.openweathermap.org/geo/1.0/direct", () =>
            HttpResponse.json([{ name, country: "AZ", lat: 40.37, lon: 49.89, local_names: {} }])
        )
    );
};

const starButtonOfSearchResult = (): HTMLElement =>
    screen.getByText("Baku, AZ").closest("li")!.querySelectorAll("button")[1];

describe("starred cities flow", () => {
    it("search, star, persist, unstar", async () => {
        searchReturns("Baku");
        const user = userEvent.setup();

        render(<CitySearch />);

        await user.type(screen.getByPlaceholderText("Search city..."), "Bak");
        expect(await screen.findByText("Baku, AZ", {}, WAIT)).toBeInTheDocument();

        await user.click(starButtonOfSearchResult());

        // It shows up under Starred, and it survives a reload.
        expect(await screen.findByText("Starred", {}, WAIT)).toBeInTheDocument();
        expect(localStorage.getItem("starredCities")).toContain("Baku");

        // Unstar it from the starred list (the first list in the DOM).
        const starredRow = screen.getByText("Starred").closest("ul")!.querySelector("li")!;
        await user.click(starredRow.querySelectorAll("button")[1]);

        await waitFor(() => expect(useStarredCitiesStore.getState().starredCities).toHaveLength(0));
        expect(localStorage.getItem("starredCities")).not.toContain("Baku");
        expect(screen.queryByText("Starred")).not.toBeInTheDocument();
    });

    it("a city starred in an earlier session is still there on the next page load", async () => {
        localStorage.setItem(
            "starredCities",
            JSON.stringify([{ name: "Ganja", country: "AZ", lat: 40.68, lon: 46.36, local_names: {} }])
        );

        // The store reads localStorage once, at module load, so a fresh page means a fresh module.
        vi.resetModules();
        const { useStarredCitiesStore: freshStore } = await import(
            "@/features/city/stores/starred-cities-store"
        );

        expect(freshStore.getState().starredCities.map((city) => city.name)).toEqual(["Ganja"]);
    });
});
