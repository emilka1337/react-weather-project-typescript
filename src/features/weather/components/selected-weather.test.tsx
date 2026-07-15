import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import SelectedWeather from "@/features/weather/components/selected-weather";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { useSettingsStore } from "@/stores/settings-store";
import { makeForecast } from "@/testing/fixtures/forecast";

const seedForecast = (): void => {
    act(() => useForecastStore.getState().setForecast(makeForecast()));
};

describe("SelectedWeather", () => {
    it("shows the loader while there is no forecast", () => {
        const { container } = render(<SelectedWeather />);

        expect(container.querySelector(".loading")).toBeInTheDocument();
        expect(container.querySelector(".selected-temperature")).not.toBeInTheDocument();
    });

    it("defaults the selection to the first forecast slot", () => {
        seedForecast();

        const { container } = render(<SelectedWeather />);

        // The fixture's first unit is 20 C.
        expect(container.querySelector(".selected-temperature")).toHaveTextContent("20");
        expect(useSelectedWeatherStore.getState().selectedWeather.selectedTemperature).toBe(20);
    });

    it("hides the feels-like field unless the setting is on", () => {
        seedForecast();

        render(<SelectedWeather />);

        expect(screen.queryByText(/Feels like/)).not.toBeInTheDocument();
    });

    it("shows the feels-like field when the setting is on", () => {
        seedForecast();
        act(() =>
            useSettingsStore.setState((state) => ({
                settings: { ...state.settings, showFeelsLikeField: true },
            }))
        );

        render(<SelectedWeather />);

        // The fixture's first unit feels like 19 C.
        expect(screen.getByText(/Feels like: 19/)).toBeInTheDocument();
    });

    it("renders the wind, sky and humidity summary", () => {
        seedForecast();

        render(<SelectedWeather />);

        expect(screen.getByText("11 km/h")).toBeInTheDocument();
        expect(screen.getByText("Clear")).toBeInTheDocument();
        expect(screen.getByText("40%")).toBeInTheDocument();
    });
});
