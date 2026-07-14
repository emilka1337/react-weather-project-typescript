import { beforeEach, describe, expect, it, vi } from "vitest";
import { Settings } from "../types/Settings";

const STORAGE_KEY = "weather-app-settings";

// The store reads localStorage once, at module load, so each test needs a fresh module registry.
async function freshStore() {
    vi.resetModules();
    return (await import("./settingsStore")).useSettingsStore;
}

const readPersisted = (): Settings | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : JSON.parse(raw);
};

describe("settingsStore", () => {
    beforeEach(() => localStorage.clear());

    it("loads settings written by the Redux build, which stored a raw settings object", async () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                showSettings: false,
                darkMode: true,
                loadingAnimation: false,
                showFeelsLikeField: true,
                temperatureInF: true,
                speedUnitInMS: true,
                showSecondsInClocks: true,
                showNotifications: true,
            })
        );

        const store = await freshStore();

        expect(store.getState().settings.temperatureInF).toBe(true);
        expect(store.getState().settings.loadingAnimation).toBe(false);
        expect(store.getState().settings.showSecondsInClocks).toBe(true);
    });

    it("backfills a key the user's saved settings predate", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ darkMode: true }));

        const store = await freshStore();

        expect(store.getState().settings.darkMode).toBe(true);
        expect(store.getState().settings.loadingAnimation).toBe(true); // from the defaults
    });

    it("falls back to defaults and clears the key when saved settings are corrupted", async () => {
        localStorage.setItem(STORAGE_KEY, "{not json");
        vi.spyOn(console, "error").mockImplementation(() => {});

        const store = await freshStore();

        expect(store.getState().settings.loadingAnimation).toBe(true);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("writes every toggle through to localStorage, replacing the old settingsMiddleware", async () => {
        const store = await freshStore();

        store.getState().toggleTemperatureScale();

        expect(store.getState().settings.temperatureInF).toBe(true);
        expect(readPersisted()?.temperatureInF).toBe(true);

        store.getState().toggleSpeedUnit();

        expect(readPersisted()?.speedUnitInMS).toBe(true);
        expect(readPersisted()?.temperatureInF).toBe(true); // earlier toggle survived
    });

    it("resets the toggles and drops the persisted settings entirely, like the old middleware", async () => {
        const store = await freshStore();

        store.getState().toggleTemperatureScale();
        store.getState().toggleNotifications();
        expect(readPersisted()).not.toBeNull();

        store.getState().resetSettings();

        expect(store.getState().settings.temperatureInF).toBe(false);
        expect(store.getState().settings.showNotifications).toBe(false);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("leaves loadingAnimation alone on reset, as the Redux reducer did", async () => {
        const store = await freshStore();

        store.getState().toggleLoadingAnimation();
        expect(store.getState().settings.loadingAnimation).toBe(false);

        store.getState().resetSettings();

        expect(store.getState().settings.loadingAnimation).toBe(false);
    });
});
