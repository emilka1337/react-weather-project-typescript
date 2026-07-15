import { render } from "@testing-library/react";
import { act, useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useTomorrowForecastNotification from "@/features/weather/hooks/use-tomorrow-forecast-notification";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSettingsStore } from "@/stores/settings-store";
import { makeForecast } from "@/testing/fixtures/forecast";

function Harness() {
    const notify = useTomorrowForecastNotification();
    useEffect(() => notify(), [notify]);
    return null;
}

// Records every web Notification constructed, and reports permission as granted.
const captureNotifications = (): string[] => {
    const fired: string[] = [];

    class MockNotification {
        static permission = "granted";
        constructor(title: string) {
            fired.push(title);
        }
    }

    vi.stubGlobal("Notification", MockNotification);
    return fired;
};

const enableNotifications = (): void => {
    act(() => {
        useForecastStore.getState().setForecast(makeForecast());
        if (!useSettingsStore.getState().settings.showNotifications) {
            useSettingsStore.getState().toggleNotifications();
        }
    });
};

describe("useTomorrowForecastNotification", () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, "chrome");
    });

    it("fires a web Notification on Pages when notifications are on and permission is granted", () => {
        const fired = captureNotifications();
        enableNotifications();

        render(<Harness />);

        expect(fired).toEqual(["Tomorrow's weather"]);
    });

    it("stays silent inside the extension - the background worker owns notifications there", () => {
        const fired = captureNotifications();
        (globalThis as { chrome?: unknown }).chrome = { runtime: { id: "abc123" } };
        enableNotifications();

        render(<Harness />);

        expect(fired).toEqual([]);
    });
});
