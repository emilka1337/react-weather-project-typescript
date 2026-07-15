import { getForecast } from "@/features/weather/api/get-forecast";
import { formatTomorrowNotification } from "@/features/weather/utils/format-tomorrow-notification";
import { summariseTomorrow } from "@/features/weather/utils/summarise-tomorrow";
import {
    extensionAssetUrl,
    readLastNotifiedYmd,
    readWeatherSyncState,
    writeLastNotifiedYmd,
} from "@/lib/extension";

// The extension's background service worker. It exists so the "tomorrow's weather" notification can
// fire while the popup is CLOSED - which is the only time a notification is actually useful. The
// popup itself is torn down the instant it closes, so the web Notification API it used before could
// never deliver anything the user wasn't already looking at.
//
// This file ships in the same bundle as the popup and Pages build, but only Chrome ever registers it
// (via manifest.background). On Pages it is dead code that never runs.

const ALARM = "tomorrow-weather";
const ICON = "favicon/android-chrome-192x192.png";

// Local calendar day, the granularity of the once-per-day dedup.
function todayYmd(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function maybeNotifyTomorrow(): Promise<void> {
    // Coordinates and the notifications toggle come from the popup via chrome.storage. No coordinates
    // means the popup has never run, so there is nothing to forecast yet.
    const state = await readWeatherSyncState();
    if (!state?.showNotifications || !state.geolocation) return;

    const ymd = todayYmd();
    if ((await readLastNotifiedYmd()) === ymd) return; // at most once per calendar day

    try {
        const forecast = await getForecast(state.geolocation);
        const tomorrow = summariseTomorrow(forecast.list);
        if (!tomorrow) return;

        const { title, body } = formatTomorrowNotification(tomorrow);
        void chrome.notifications.create({
            type: "basic",
            iconUrl: extensionAssetUrl(ICON),
            title,
            message: body,
        });

        // Mark the day only after a notification actually went out, so a failed fetch retries on the
        // next alarm instead of being silently swallowed for the rest of the day.
        await writeLastNotifiedYmd(ymd);
    } catch (error) {
        console.error("[background] tomorrow-weather notification failed:", error);
    }
}

// Alarms survive worker restarts, but recreating on both install and startup is cheap insurance. The
// short initial delay makes the notification observable shortly after loading the extension.
function ensureAlarm(): void {
    void chrome.alarms.create(ALARM, { delayInMinutes: 1, periodInMinutes: 60 });
}

chrome.runtime.onInstalled.addListener(ensureAlarm);
chrome.runtime.onStartup.addListener(ensureAlarm);

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM) void maybeNotifyTomorrow();
});
