import { describe, expect, it } from "vitest";

import { separateListByWeekdays } from "@/features/weather/utils/separate-list-by-weekdays";
import { makeForecast, makeForecastUnit } from "@/testing/fixtures/forecast";

const weekdayOf = (dt: number): number => new Date(dt * 1000).getDay();

describe("separateListByWeekdays", () => {
    it("returns nothing for an empty forecast", () => {
        expect(separateListByWeekdays([])).toEqual([]);
    });

    it("keeps every unit and puts each in the bucket for its own weekday", () => {
        const forecast = makeForecast();

        const days = separateListByWeekdays(forecast);

        expect(days.flat()).toHaveLength(forecast.length);
        for (const day of days) {
            expect(day.length).toBeGreaterThan(0);
            for (const unit of day) {
                expect(unit.weekday).toBe(weekdayOf(unit.dt));
                expect(unit.weekday).toBe(day[0].weekday);
            }
        }
    });

    it("produces one bucket per distinct weekday, in chronological order", () => {
        const forecast = makeForecast();

        const days = separateListByWeekdays(forecast);

        const distinctWeekdays = new Set(forecast.map((unit) => weekdayOf(unit.dt)));
        expect(days).toHaveLength(distinctWeekdays.size);

        const firstTimestamps = days.map((day) => day[0].dt);
        expect(firstTimestamps).toEqual([...firstTimestamps].sort((a, b) => a - b));
    });

    // The regression that matters: the old implementation looped `while (total < 40)` and pushed
    // empty arrays forever on any list the sum could never reach 40 from.
    it("terminates on a list shorter than 40 units", () => {
        const short = makeForecast().slice(0, 5);

        const started = Date.now();
        const days = separateListByWeekdays(short);

        expect(Date.now() - started).toBeLessThan(50);
        expect(days.flat()).toHaveLength(5);
    });

    it("does not mutate the units it was given", () => {
        const unit = makeForecastUnit(0, 20);

        separateListByWeekdays([unit]);

        expect(unit.weekday).toBeUndefined();
    });
});
