import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useSettingsStore } from "@/stores/settings-store";
import { BAKU } from "@/testing/mocks/handlers";

const WAIT = { timeout: 3000 };
const STORAGE_KEY = "weather-app-settings";

const mockGeolocation = (): void => {
    vi.stubGlobal("navigator", {
        ...navigator,
        geolocation: {
            getCurrentPosition: (success: PositionCallback) =>
                success({
                    coords: { latitude: BAKU.lat, longitude: BAKU.lon },
                    timestamp: 0,
                } as GeolocationPosition),
        },
    });
};

const openSettings = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
    await user.click(screen.getByRole("button", { name: "Open settings" }));
};

describe("settings flow", () => {
    beforeEach(mockGeolocation);

    it("opening settings, toggling dark mode, and seeing the whole app change", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        expect(container.querySelector(".app.dark")).toBeNull();

        await openSettings(user);
        await user.click(screen.getByText("Dark mode"));

        await waitFor(() => expect(container.querySelector(".app.dark")).not.toBeNull(), WAIT);
        expect(useSettingsStore.getState().settings.darkMode).toBe(true);
    });

    it("switching to fahrenheit updates the temperature the app is already showing", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("20"),
            WAIT
        );

        await openSettings(user);
        await user.click(screen.getByText("Temperature in F°"));

        await waitFor(
            () => expect(container.querySelector(".selected-temperature")).toHaveTextContent("68"),
            WAIT
        );
    });

    it("resetting restores the defaults and clears the saved settings", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await openSettings(user);
        await user.click(screen.getByText("Temperature in F°"));
        await user.click(screen.getByText("Dark mode"));
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

        await user.click(screen.getAllByRole("button", { name: "Reset" })[0]);

        await waitFor(() => expect(container.querySelector(".app.dark")).toBeNull(), WAIT);
        expect(useSettingsStore.getState().settings.temperatureInF).toBe(false);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("settings saved in an earlier session are applied on the next page load", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ darkMode: true, temperatureInF: true }));

        vi.resetModules();
        const { useSettingsStore: freshStore } = await import("@/stores/settings-store");

        expect(freshStore.getState().settings.darkMode).toBe(true);
        expect(freshStore.getState().settings.temperatureInF).toBe(true);
        // Backfilled from the defaults, not left undefined.
        expect(freshStore.getState().settings.loadingAnimation).toBe(true);
    });
});
