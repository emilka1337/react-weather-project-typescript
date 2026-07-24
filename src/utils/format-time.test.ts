import { describe, expect, it } from "vitest";

import { formatTime } from "@/utils/format-time";

describe("formatTime", () => {
    it("zero-pads hours and minutes", () => {
        expect(formatTime({ hours: 9, minutes: 5 })).toBe("09:05");
    });

    // The clock's own version tested `if (hours && +hours < 10)`. 0 is falsy, so it skipped the
    // padding and rendered midnight as "0:05".
    it("pads midnight rather than treating hour 0 as absent", () => {
        expect(formatTime({ hours: 0, minutes: 5 })).toBe("00:05");
        expect(formatTime({ hours: 0, minutes: 0 })).toBe("00:00");
    });

    it("leaves two-digit values alone", () => {
        expect(formatTime({ hours: 23, minutes: 59 })).toBe("23:59");
    });

    it("appends seconds only when asked", () => {
        const time = { hours: 12, minutes: 30, seconds: 7 };

        expect(formatTime(time)).toBe("12:30");
        expect(formatTime(time, true)).toBe("12:30:07");
    });

    it("treats a missing seconds field as zero when showing seconds", () => {
        expect(formatTime({ hours: 1, minutes: 2 }, true)).toBe("01:02:00");
    });
});
