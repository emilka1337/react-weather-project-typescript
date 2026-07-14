import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Clocks from "@/features/clock/components/clocks";
import { useSettingsStore } from "@/stores/settings-store";

const setNow = (hours: number, minutes: number, seconds = 0): void => {
    vi.setSystemTime(new Date(2024, 0, 1, hours, minutes, seconds));
};

describe("Clocks", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setNow(9, 5);
    });

    afterEach(() => vi.useRealTimers());

    it("renders the current time, zero-padded", () => {
        render(<Clocks />);

        expect(screen.getByText("09:05")).toBeInTheDocument();
    });

    it("pads midnight instead of rendering 0:05", () => {
        setNow(0, 5);

        render(<Clocks />);

        expect(screen.getByText("00:05")).toBeInTheDocument();
    });

    it("ticks every second", () => {
        render(<Clocks />);

        setNow(9, 6);
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText("09:06")).toBeInTheDocument();
    });

    // The regression that matters: setTime was a useCallback with an empty dependency array, so
    // the interval kept calling the first render's closure and this toggle did nothing until reload.
    it("shows seconds as soon as the setting is toggled, without a reload", () => {
        setNow(9, 5, 7);
        render(<Clocks />);

        expect(screen.getByText("09:05")).toBeInTheDocument();

        // No timer advance: the effect must re-run on the new setting and repaint immediately.
        act(() => useSettingsStore.getState().toggleSecondsInClocks());

        expect(screen.getByText("09:05:07")).toBeInTheDocument();
    });

    it("stops ticking once unmounted", () => {
        const { unmount } = render(<Clocks />);
        const clearInterval = vi.spyOn(globalThis, "clearInterval");

        unmount();

        expect(clearInterval).toHaveBeenCalled();
    });
});
