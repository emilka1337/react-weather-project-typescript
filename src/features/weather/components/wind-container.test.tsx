import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WindContainer from "@/features/weather/components/wind-container";
import { useSettingsStore } from "@/stores/settings-store";

const arrowOf = (container: HTMLElement): HTMLElement | null => container.querySelector("svg.wind");

describe("WindContainer", () => {
    it("renders km/h by default", () => {
        render(<WindContainer speed={3} degree={180} />);

        expect(screen.getByText("11 km/h")).toBeInTheDocument();
    });

    it("renders m/s when the setting says so", () => {
        useSettingsStore.setState((state) => ({
            settings: { ...state.settings, speedUnitInMS: true },
        }));

        render(<WindContainer speed={3} degree={180} />);

        expect(screen.getByText("3.0 m/s")).toBeInTheDocument();
    });

    it("points the arrow along the wind direction", () => {
        const { container } = render(<WindContainer speed={3} degree={225} />);

        expect(arrowOf(container)?.style.transform).toContain("rotate(225deg)");
    });

    it.each([
        [2, "scale(0.5)"], // <= 4 m/s: smallest
        [6, "scale(0.75)"], // between 4 and 8: proportional
        [10, "scale(1.2)"], // >= 8 m/s: largest
    ])("scales the arrow for %i m/s", (speed, expected) => {
        const { container } = render(<WindContainer speed={speed} degree={0} />);

        expect(arrowOf(container)?.style.transform).toContain(expected);
    });
});
