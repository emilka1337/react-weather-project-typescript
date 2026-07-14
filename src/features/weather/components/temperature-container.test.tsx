import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TemperatureContainer from "@/features/weather/components/temperature-container";
import { useSettingsStore } from "@/stores/settings-store";

describe("TemperatureContainer", () => {
    it("renders whole degrees celsius and the sky description", () => {
        render(<TemperatureContainer temperature={20.6} main="Clear" />);

        expect(screen.getByText("21")).toBeInTheDocument();
        expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    it("switches to fahrenheit when the setting says so", () => {
        useSettingsStore.setState((state) => ({
            settings: { ...state.settings, temperatureInF: true },
        }));

        render(<TemperatureContainer temperature={20} main="Clear" />);

        expect(screen.getByText("68")).toBeInTheDocument();
    });
});
