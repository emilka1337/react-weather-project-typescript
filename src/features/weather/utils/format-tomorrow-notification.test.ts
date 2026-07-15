import { describe, expect, it } from "vitest";

import { formatTomorrowNotification } from "@/features/weather/utils/format-tomorrow-notification";

describe("formatTomorrowNotification", () => {
    it("titles it, converts wind to km/h, and rounds every figure", () => {
        // 9.7 m/s * 3.6 = 34.92 -> 35; temperatures round to whole degrees.
        const content = formatTomorrowNotification({ minTemp: 5.4, maxTemp: 25.6, maxWind: 9.7 });

        expect(content.title).toBe("Tomorrow's weather");
        expect(content.body).toBe("💨Max wind: 35 km/h\n🔥Max temperature: 26°\n❄Min temperature: 5°");
    });
});
