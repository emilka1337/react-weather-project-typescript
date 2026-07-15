import { CommonForecastByDay } from "@/features/weather/types/common-forecast-by-day";

export interface NotificationContent {
    readonly title: string;
    readonly body: string;
}

// Keeps the wording identical whether it is rendered by chrome.notifications (background worker) or
// the web Notification API (Pages fallback). Metric, matching the original notification - the unit
// settings are deliberately not threaded through here; that would be a separate change.
export function formatTomorrowNotification(summary: CommonForecastByDay): NotificationContent {
    return {
        title: "Tomorrow's weather",
        body:
            `💨Max wind: ${(summary.maxWind * 3.6).toFixed(0)} km/h\n` +
            `🔥Max temperature: ${summary.maxTemp.toFixed(0)}°\n` +
            `❄Min temperature: ${summary.minTemp.toFixed(0)}°`,
    };
}
