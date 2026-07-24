import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import DailyForecast from "@/features/weather/components/daily-forecast";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { separateListByWeekdays } from "@/features/weather/utils/separate-list-by-weekdays";
import { makeForecast } from "@/testing/fixtures/forecast";

describe("DailyForecast", () => {
    it("renders nothing at all while there is no forecast", () => {
        const { container } = render(<DailyForecast />);

        expect(container).toBeEmptyDOMElement();
    });

    it("renders one column per weekday in the forecast", () => {
        const forecast = makeForecast();
        act(() => useForecastStore.getState().setForecast(forecast));

        const { container } = render(<DailyForecast />);

        const expectedDays = separateListByWeekdays(forecast).length;
        expect(container.querySelectorAll("li.forecast-day")).toHaveLength(expectedDays);
    });

    it("renders every forecast slot as a cell, across all the columns", () => {
        const forecast = makeForecast();
        act(() => useForecastStore.getState().setForecast(forecast));

        const { container } = render(<DailyForecast />);

        expect(container.querySelectorAll(".forecast-cell")).toHaveLength(forecast.length);
    });

    it("renders the mode toggle panel alongside the days", () => {
        act(() => useForecastStore.getState().setForecast(makeForecast()));

        render(<DailyForecast />);

        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});
