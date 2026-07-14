import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import DailyForecast from "@/features/weather/components/daily-forecast";
import SelectedWeather from "@/features/weather/components/selected-weather";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSettingsStore } from "@/stores/settings-store";
import { makeForecast } from "@/testing/fixtures/forecast";

const WAIT = { timeout: 3000 };

// The forecast list and the selected-weather panel are one feature, not two: the panel is a
// projection of whichever slot you clicked in the list. This is that master/detail pair, wired up.
const renderWeather = () =>
    render(
        <>
            <SelectedWeather />
            <DailyForecast />
        </>
    );

describe("forecast flow", () => {
    it("clicking a forecast slot drives the selected-weather panel", async () => {
        const user = userEvent.setup();
        act(() => useForecastStore.getState().setForecast(makeForecast()));

        const { container } = renderWeather();

        // Starts on the first slot: 20 C.
        expect(container.querySelector(".selected-temperature")).toHaveTextContent("20");

        // The fixture's fourth slot is 23 C.
        await user.click(container.querySelectorAll(".forecast-cell")[3]);

        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("23"),
            WAIT
        );
    });

    it("switching to fahrenheit re-renders both the cells and the panel", async () => {
        act(() => useForecastStore.getState().setForecast(makeForecast()));

        const { container } = renderWeather();

        expect(container.querySelector(".selected-temperature")).toHaveTextContent("20");
        expect(container.querySelectorAll(".temperature")[0]).toHaveTextContent("20");

        act(() => useSettingsStore.getState().toggleTemperatureScale());

        // 20 C -> 68 F, everywhere at once.
        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("68"),
            WAIT
        );
        expect(container.querySelectorAll(".temperature")[0]).toHaveTextContent("68");
    });

    it("switching the forecast mode swaps every cell over to wind", async () => {
        const user = userEvent.setup();
        act(() => useForecastStore.getState().setForecast(makeForecast()));

        const { container } = renderWeather();
        expect(container.querySelectorAll(".wind-container")).toHaveLength(0);

        await user.click(screen.getAllByRole("button")[1]); // the wind toggler

        await waitFor(
            () => expect(container.querySelectorAll(".wind-container").length).toBeGreaterThan(0),
            WAIT
        );
        expect(container.querySelectorAll(".temperature-container")).toHaveLength(0);
    });
});
