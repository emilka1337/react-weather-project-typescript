import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ForecastModeTogglePanel from "@/features/weather/components/forecast-mode-toggle-panel";
import { useForecastModeStore } from "@/features/weather/stores/forecast-mode-store";
import { ForecastModes } from "@/features/weather/types/forecast-mode";

const togglers = (): HTMLElement[] => screen.getAllByRole("button");

describe("ForecastModeTogglePanel", () => {
    it("marks temperature active by default", () => {
        render(<ForecastModeTogglePanel />);

        const [temperature, wind, humidity] = togglers();

        expect(temperature).toHaveClass("active");
        expect(wind).not.toHaveClass("active");
        expect(humidity).not.toHaveClass("active");
    });

    it("switches the store and the active class when wind is clicked", async () => {
        const user = userEvent.setup();
        render(<ForecastModeTogglePanel />);

        await user.click(togglers()[1]);

        expect(useForecastModeStore.getState().forecastMode).toBe(ForecastModes.WIND);
        expect(togglers()[1]).toHaveClass("active");
        expect(togglers()[0]).not.toHaveClass("active");
    });

    it("switches to humidity", async () => {
        const user = userEvent.setup();
        render(<ForecastModeTogglePanel />);

        await user.click(togglers()[2]);

        expect(useForecastModeStore.getState().forecastMode).toBe(ForecastModes.HUMIDITY);
        expect(togglers()[2]).toHaveClass("active");
    });
});
