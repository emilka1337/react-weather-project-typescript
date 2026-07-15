import { useEffect } from "react";

import { writeWeatherSyncState } from "@/lib/extension";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { useSettingsStore } from "@/stores/settings-store";

// Mirrors the slice of state the background worker needs - current coordinates and the notifications
// toggle - into chrome.storage whenever it changes, so the worker can fetch and notify with the popup
// closed. A no-op on GitHub Pages: writeWeatherSyncState short-circuits when there is no extension
// runtime, so this hook is safe to call unconditionally.
export default function useExtensionStorageSync(): void {
    const geolocation = useGeolocationStore((state) => state.geolocation);
    const showNotifications = useSettingsStore((state) => state.settings.showNotifications);

    useEffect(() => {
        const hasFix = Boolean(geolocation.lat) && Boolean(geolocation.lon);

        void writeWeatherSyncState({
            geolocation: hasFix ? geolocation : null,
            showNotifications,
        });
    }, [geolocation, showNotifications]);
}
