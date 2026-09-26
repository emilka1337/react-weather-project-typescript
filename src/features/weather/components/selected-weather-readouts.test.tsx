import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import FeelsLikeField from "@/features/weather/components/feels-like-field";
import MoreWeatherInfo from "@/features/weather/components/more-weather-info";
import SelectedTemperature from "@/features/weather/components/selected-temperature";
import { useSelectedWeatherStore } from "@/features/weather/stores/selected-weather-store";
import { useSettingsStore } from "@/stores/settings-store";
import { makeForecastUnit } from "@/testing/fixtures/forecast";

// The readouts of the selected-weather panel. Each reads the selected forecast slot and a unit
// setting; these tests pin down that both kinds of change reach the screen.
const select = (index: number, temp: number): void => {
    act(() => useSelectedWeatherStore.getState().setSelectedWeather(makeForecastUnit(index, temp)));
};

describe("SelectedTemperature", () => {
    it("shows the selected slot's temperature and follows a new selection", () => {
        select(0, 21);
        const { container } = render(<SelectedTemperature />);

        expect(container).toHaveTextContent("21°");

        select(1, 5);

        expect(container).toHaveTextContent("5°");
    });

    it("switches to Fahrenheit when the setting flips", () => {
        select(0, 20);
        const { container } = render(<SelectedTemperature />);

        act(() => useSettingsStore.getState().toggleTemperatureScale());

        expect(container).toHaveTextContent("68°");
    });
});

describe("FeelsLikeField", () => {
    it("shows the selected slot's feels-like temperature, in the chosen scale", () => {
        select(0, 11); // feels_like = temp - 1 in the fixture
        render(<FeelsLikeField />);

        expect(screen.getByText("Feels like: 10")).toBeInTheDocument();

        act(() => useSettingsStore.getState().toggleTemperatureScale());

        expect(screen.getByText("Feels like: 50")).toBeInTheDocument();
    });
});

describe("MoreWeatherInfo", () => {
    it("shows wind, sky and humidity for the selected slot", () => {
        select(0, 20); // wind 3 m/s, humidity 40%, "Clear"
        const { container } = render(<MoreWeatherInfo />);

        expect(container.querySelector(".wind")).toHaveTextContent("11 km/h");
        expect(container.querySelector(".sky")).toHaveTextContent("Clear");
        expect(container.querySelector(".humidity")).toHaveTextContent("40%");
    });

    it("follows a new selection and the wind-unit setting", () => {
        select(0, 20);
        const { container } = render(<MoreWeatherInfo />);

        select(10, 20); // wind 4 m/s, humidity 50%

        expect(container.querySelector(".wind")).toHaveTextContent("14 km/h");
        expect(container.querySelector(".humidity")).toHaveTextContent("50%");

        act(() => useSettingsStore.getState().toggleSpeedUnit());

        expect(container.querySelector(".wind")).toHaveTextContent("4.0 m/s");
    });
});
