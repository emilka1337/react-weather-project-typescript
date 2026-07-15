import { describe, expect, it } from "vitest";

import { celsiusToFahrenheit, formatTemperature, formatWindSpeed } from "@/features/weather/utils/units";

describe("celsiusToFahrenheit", () => {
    it.each([
        [0, 32],
        [20, 68],
        [100, 212],
        [-40, -40],
    ])("converts %i C to %i F", (celsius, fahrenheit) => {
        expect(celsiusToFahrenheit(celsius)).toBeCloseTo(fahrenheit);
    });
});

describe("formatTemperature", () => {
    it("rounds to whole degrees celsius", () => {
        expect(formatTemperature(20.6, false)).toBe("21");
        expect(formatTemperature(-0.4, false)).toBe("-0");
    });

    it("converts before rounding when fahrenheit is on", () => {
        expect(formatTemperature(20, true)).toBe("68");
    });
});

describe("formatWindSpeed", () => {
    it("converts m/s to whole km/h by default", () => {
        expect(formatWindSpeed(3, false)).toBe("11 km/h");
        expect(formatWindSpeed(0, false)).toBe("0 km/h");
    });

    it("keeps one decimal for m/s, with a space before the unit", () => {
        expect(formatWindSpeed(3, true)).toBe("3.0 m/s");
        expect(formatWindSpeed(3.46, true)).toBe("3.5 m/s");
    });
});
