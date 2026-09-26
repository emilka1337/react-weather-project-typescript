import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useExtensionStorageSync from "@/hooks/use-extension-storage-sync";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { useSettingsStore } from "@/stores/settings-store";

const SYNC_KEY = "weather-sync-state";

// A minimal extension runtime: only what writeWeatherSyncState touches.
const asExtension = () => {
    const set = vi.fn<(items: Record<string, unknown>) => Promise<void>>(() => Promise.resolve());
    (globalThis as { chrome?: unknown }).chrome = { runtime: { id: "abc123" }, storage: { local: { set } } };
    return set;
};

describe("useExtensionStorageSync", () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, "chrome");
    });

    it("mirrors 'no fix yet' as a null geolocation, so the worker does not fetch for 0,0", async () => {
        const set = asExtension();

        renderHook(() => useExtensionStorageSync());

        await waitFor(() =>
            expect(set).toHaveBeenLastCalledWith({
                [SYNC_KEY]: { geolocation: null, showNotifications: false },
            }),
        );
    });

    it("re-mirrors whenever the coordinates or the notifications toggle change", async () => {
        const set = asExtension();
        renderHook(() => useExtensionStorageSync());

        act(() => useGeolocationStore.getState().setGeolocation({ lat: 40.37, lon: 49.89 }));
        act(() => useSettingsStore.getState().toggleNotifications());

        await waitFor(() =>
            expect(set).toHaveBeenLastCalledWith({
                [SYNC_KEY]: { geolocation: { lat: 40.37, lon: 49.89 }, showNotifications: true },
            }),
        );
        expect(set).toHaveBeenCalledTimes(3);
    });

    it("is a no-op on GitHub Pages, where there is no extension runtime", () => {
        expect(() => renderHook(() => useExtensionStorageSync())).not.toThrow();
        expect((globalThis as { chrome?: unknown }).chrome).toBeUndefined();
    });
});
