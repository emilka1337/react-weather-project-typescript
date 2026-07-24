import { describe, expect, it } from "vitest";

import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { summariseTomorrow } from "@/features/weather/utils/summarise-tomorrow";
import { makeForecastUnit } from "@/testing/fixtures/forecast";

const H = 3600;
const DAY = 24 * H;

// Anchored at 9am local, so a day's 9/12/15h slots never cross local midnight - the weekday bucketing
// then lands the same way no matter what timezone the test runs in.
const dayAnchor = (): number => {
    const d = new Date(1_700_000_000 * 1000);
    d.setHours(9, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
};

const unit = (dt: number, temp: number, wind: number): ForecastUnit => ({
    ...makeForecastUnit(0, temp),
    dt,
    wind: { deg: 180, speed: wind },
});

describe("summariseTomorrow", () => {
    it("returns null for an empty forecast", () => {
        expect(summariseTomorrow([])).toBeNull();
    });

    it("returns null when the forecast has only one day - there is no tomorrow", () => {
        const t0 = dayAnchor();

        expect(summariseTomorrow([unit(t0, 10, 2), unit(t0 + 3 * H, 15, 4)])).toBeNull();
    });

    it("summarises tomorrow's min/max temperature and max wind across its slots, ignoring today", () => {
        const t0 = dayAnchor();
        const forecast = [
            // Today - the extreme values here must not leak into tomorrow's summary.
            unit(t0, 99, 99),
            unit(t0 + 3 * H, -99, 0),
            // Tomorrow.
            unit(t0 + DAY, 5, 1),
            unit(t0 + DAY + 3 * H, 25, 9),
            unit(t0 + DAY + 6 * H, 12, 3),
        ];

        expect(summariseTomorrow(forecast)).toEqual({ minTemp: 5, maxTemp: 25, maxWind: 9 });
    });
});
