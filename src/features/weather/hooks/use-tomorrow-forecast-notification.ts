import { useCallback } from "react";

import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { formatTomorrowNotification } from "@/features/weather/utils/format-tomorrow-notification";
import { summariseTomorrow } from "@/features/weather/utils/summarise-tomorrow";
import { extensionAssetUrl, isExtension } from "@/lib/extension";
import { useSettingsStore } from "@/stores/settings-store";

// The Pages fallback for the tomorrow notification. In the extension the background service worker
// owns notifications (it can fire with the popup closed), so this path no-ops there to avoid a
// double notification. On Pages the web Notification API is the best available - it only fires while
// the tab is open, but there is no service worker to hand it off to.
//
// Returns a stable callback, so the caller's effect can depend on it without re-firing every render.
export default function useTomorrowForecastNotification(): () => void {
    const forecast = useForecastStore((state) => state.forecast);
    const notificationsEnabled: boolean = useSettingsStore((state) => state.settings.showNotifications);

    return useCallback(() => {
        if (isExtension()) return;
        if (!notificationsEnabled || Notification.permission !== "granted" || !forecast.length) return;

        const tomorrow = summariseTomorrow(forecast);
        if (!tomorrow) return;

        const { title, body } = formatTomorrowNotification(tomorrow);
        new Notification(title, {
            body,
            icon: extensionAssetUrl("favicon/android-chrome-192x192.png"),
        });
    }, [forecast, notificationsEnabled]);
}
