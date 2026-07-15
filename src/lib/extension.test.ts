import { afterEach, describe, expect, it } from "vitest";

import {
    extensionAssetUrl,
    isExtension,
    readLastNotifiedYmd,
    readWeatherSyncState,
    writeLastNotifiedYmd,
    writeWeatherSyncState,
} from "@/lib/extension";

// A minimal chrome stand-in: a runtime with an id (the tell isExtension() looks for) and an
// in-memory chrome.storage.local. Assigned onto globalThis directly rather than via vi.stubGlobal, so
// afterEach can remove only `chrome` without disturbing the localStorage/matchMedia/Notification
// stubs the shared setup installs.
function fakeChrome() {
    const store: Record<string, unknown> = {};

    return {
        runtime: {
            id: "abc123",
            getURL: (path: string) => `chrome-extension://abc123/${path}`,
        },
        storage: {
            local: {
                get: (key: string) => Promise.resolve({ [key]: store[key] }),
                set: (items: Record<string, unknown>) => {
                    Object.assign(store, items);
                    return Promise.resolve();
                },
            },
        },
    };
}

const asExtension = (): void => {
    (globalThis as { chrome?: unknown }).chrome = fakeChrome();
};

describe("extension bridge", () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, "chrome");
    });

    it("is not an extension when there is no chrome runtime (GitHub Pages)", () => {
        expect(isExtension()).toBe(false);
    });

    it("is an extension when chrome.runtime.id is present", () => {
        asExtension();

        expect(isExtension()).toBe(true);
    });

    it("resolves asset URLs relatively off-extension, and via runtime.getURL on-extension", () => {
        expect(extensionAssetUrl("favicon/icon.png")).toBe("./favicon/icon.png");

        asExtension();

        expect(extensionAssetUrl("favicon/icon.png")).toBe("chrome-extension://abc123/favicon/icon.png");
    });

    it("no-ops storage off-extension: writes do nothing and reads come back null", async () => {
        await writeWeatherSyncState({ geolocation: { lat: 1, lon: 2 }, showNotifications: true });
        await writeLastNotifiedYmd("2026-7-15");

        expect(await readWeatherSyncState()).toBeNull();
        expect(await readLastNotifiedYmd()).toBeNull();
    });

    it("round-trips the worker's sync state through chrome.storage on-extension", async () => {
        asExtension();
        const state = { geolocation: { lat: 40.4, lon: 49.8 }, showNotifications: true };

        await writeWeatherSyncState(state);

        expect(await readWeatherSyncState()).toEqual(state);
    });

    it("round-trips the once-per-day marker, reading null before anything is written", async () => {
        asExtension();

        expect(await readLastNotifiedYmd()).toBeNull();

        await writeLastNotifiedYmd("2026-7-15");
        expect(await readLastNotifiedYmd()).toBe("2026-7-15");
    });
});
