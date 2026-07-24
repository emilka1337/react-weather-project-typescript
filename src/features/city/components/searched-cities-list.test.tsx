import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import SearchedCitiesList from "@/features/city/components/searched-cities-list";
import { useSelectedCityStore } from "@/features/city/stores/selected-city-store";
import { useStarredCitiesStore } from "@/features/city/stores/starred-cities-store";
import { SearchCity } from "@/features/city/types/search-city";
import { useGeolocationStore } from "@/stores/geolocation-store";

const baku: SearchCity = { name: "Baku", country: "AZ", lat: 40.37, lon: 49.89 };

describe("SearchedCitiesList", () => {
    it("renders nothing but an empty list when there are no results", () => {
        render(<SearchedCitiesList citiesList={[]} />);

        expect(screen.queryByText("Search")).not.toBeInTheDocument();
    });

    it("lists each result as name, country", () => {
        render(<SearchedCitiesList citiesList={[baku]} />);

        expect(screen.getByText("Baku, AZ")).toBeInTheDocument();
    });

    // The seam the whole app hangs off: picking a city writes coordinates into the SHARED
    // geolocation store, and the weather feature reacts to that. The two never touch each other.
    it("picking a city sets both the selected city and the shared geolocation", async () => {
        const user = userEvent.setup();
        render(<SearchedCitiesList citiesList={[baku]} />);

        await user.click(screen.getByText("Baku, AZ"));

        expect(useSelectedCityStore.getState().selectedCity).toBe("Baku");
        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 40.37, lon: 49.89 });
    });

    it("stars a city", async () => {
        const user = userEvent.setup();
        const { container } = render(<SearchedCitiesList citiesList={[baku]} />);

        await user.click(container.querySelectorAll("button")[1]);

        expect(useStarredCitiesStore.getState().starredCities).toHaveLength(1);
    });

    it("does not add the same city twice", async () => {
        const user = userEvent.setup();
        const { container } = render(<SearchedCitiesList citiesList={[baku]} />);
        const star = container.querySelectorAll("button")[1];

        await user.click(star);
        await user.click(star);

        expect(useStarredCitiesStore.getState().starredCities).toHaveLength(1);
    });
});
