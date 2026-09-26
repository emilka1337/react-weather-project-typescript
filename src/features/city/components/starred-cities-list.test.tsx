import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import StarredCitiesList from "@/features/city/components/starred-cities-list";
import { useSelectedCityStore } from "@/features/city/stores/selected-city-store";
import { useStarredCitiesStore } from "@/features/city/stores/starred-cities-store";
import { SearchCity } from "@/features/city/types/search-city";
import { useGeolocationStore } from "@/stores/geolocation-store";

const baku: SearchCity = { name: "Baku", country: "AZ", lat: 40.37, lon: 49.89 };
const ganja: SearchCity = { name: "Ganja", country: "AZ", lat: 40.68, lon: 46.36 };

const seed = (...cities: SearchCity[]): void => {
    act(() => useStarredCitiesStore.setState({ starredCities: cities }));
};

describe("StarredCitiesList", () => {
    it("hides the Starred heading when nothing is starred", () => {
        render(<StarredCitiesList />);

        expect(screen.queryByText("Starred")).not.toBeInTheDocument();
    });

    it("lists the starred cities under a heading", () => {
        seed(baku, ganja);

        render(<StarredCitiesList />);

        expect(screen.getByText("Starred")).toBeInTheDocument();
        expect(screen.getByText("Baku, AZ")).toBeInTheDocument();
        expect(screen.getByText("Ganja, AZ")).toBeInTheDocument();
    });

    it("picking a starred city sets the selected city and the shared geolocation", async () => {
        const user = userEvent.setup();
        seed(baku);
        render(<StarredCitiesList />);

        await user.click(screen.getByText("Baku, AZ"));

        expect(useSelectedCityStore.getState().selectedCity).toBe("Baku");
        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 40.37, lon: 49.89 });
    });

    it("unstars the city at that position and persists the result", async () => {
        const user = userEvent.setup();
        seed(baku, ganja);
        render(<StarredCitiesList />);

        await user.click(screen.getByRole("button", { name: "Remove Baku" }));

        expect(useStarredCitiesStore.getState().starredCities.map((c) => c.name)).toEqual(["Ganja"]);
        expect(localStorage.getItem("starredCities")).toContain("Ganja");
        expect(localStorage.getItem("starredCities")).not.toContain("Baku");
    });
});
