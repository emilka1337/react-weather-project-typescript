import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import ForecastCell from "@/features/weather/components/forecast-cell";
import { useForecastModeStore } from "@/features/weather/stores/forecast-mode-store";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { ForecastModes } from "@/features/weather/types/forecast-mode";
import { makeForecastUnit } from "@/testing/fixtures/forecast";

// 2024-01-01 09:05 local, so the rendered label is timezone-independent.
const AT_0905 = new Date(2024, 0, 1, 9, 5).getTime() / 1000;

const unit = makeForecastUnit(0, 21.6);

const renderCell = () => render(<ForecastCell cellForecast={unit} timestamp={AT_0905} />);

describe("ForecastCell", () => {
    it("renders the zero-padded time of the slot", () => {
        renderCell();

        expect(screen.getByText("09:05")).toBeInTheDocument();
    });

    it("shows the temperature in temperature mode", () => {
        const { container } = renderCell();

        // The value and the degree sign are separate nodes, so match on the element.
        // 21.6 C rounds to 22.
        expect(container.querySelector(".temperature")).toHaveTextContent("22");
    });

    it("lazily renders the wind container in wind mode", async () => {
        act(() => useForecastModeStore.getState().setForecastMode(ForecastModes.WIND));

        renderCell();

        // Behind Suspense, so it arrives on a later tick.
        expect(await screen.findByText("11 km/h")).toBeInTheDocument();
    });

    it("lazily renders the humidity container in humidity mode", async () => {
        act(() => useForecastModeStore.getState().setForecastMode(ForecastModes.HUMIDITY));

        renderCell();

        expect(await screen.findByText("40%")).toBeInTheDocument();
    });

    it("is a real button, so it is focusable and in the tab order", () => {
        renderCell();

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("puts the clicked unit into the selected-weather store", async () => {
        const user = userEvent.setup();
        renderCell();

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            const { selectedWeather } = useSelectedWeatherStore.getState();

            expect(selectedWeather.selectedTemperature).toBe(21.6);
            expect(selectedWeather.selectedMain).toBe("Clear");
        });
    });

    it("can be activated from the keyboard", async () => {
        const user = userEvent.setup();
        renderCell();

        screen.getByRole("button").focus();
        await user.keyboard("{Enter}");

        expect(useSelectedWeatherStore.getState().selectedTimestamp).toBe(unit.dt);
    });

    // Active state is derived from the store now (selectedTimestamp), not toggled by a
    // querySelectorAll sweep. aria-pressed lets a screen reader announce which slot is selected.
    it("reflects selection through aria-pressed and the active indicator", async () => {
        const user = userEvent.setup();
        const { container } = renderCell();

        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
        expect(container.querySelector(".active-indicator")).not.toHaveClass("show");

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
        expect(container.querySelector(".active-indicator")).toHaveClass("show");
    });

    it("has an accessible name that survives a mode change", () => {
        renderCell();

        expect(screen.getByRole("button", { name: "Forecast at 09:05" })).toBeInTheDocument();
    });
});
