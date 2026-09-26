import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ForecastDay from "@/features/weather/components/forecast-day";
import HumidityContainer from "@/features/weather/components/humidity-container";
import { makeForecastUnit } from "@/testing/fixtures/forecast";

const day = [makeForecastUnit(0, 20), makeForecastUnit(1, 21), makeForecastUnit(2, 22)];

describe("ForecastDay", () => {
    it.each([
        [0, "Sun"],
        [3, "Wed"],
        [6, "Sat"],
    ])("labels weekday %i as %s", (weekday, label) => {
        render(<ForecastDay day={day} weekday={weekday} />);

        expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    });

    it("renders one forecast cell per slot, and re-renders for a different day", () => {
        const { rerender } = render(<ForecastDay day={day} weekday={1} />);

        expect(screen.getAllByRole("button", { name: /^Forecast at/ })).toHaveLength(3);

        rerender(<ForecastDay day={day.slice(0, 1)} weekday={2} />);

        expect(screen.getAllByRole("button", { name: /^Forecast at/ })).toHaveLength(1);
        expect(screen.getByRole("heading", { name: "Tue" })).toBeInTheDocument();
    });
});

describe("HumidityContainer", () => {
    it("shows the humidity and updates with new props", () => {
        const { rerender } = render(<HumidityContainer humidity={42} />);

        expect(screen.getByText("42%")).toBeInTheDocument();

        rerender(<HumidityContainer humidity={87} />);

        expect(screen.getByText("87%")).toBeInTheDocument();
    });
});
