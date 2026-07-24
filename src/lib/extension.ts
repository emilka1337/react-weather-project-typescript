import { CityGeolocation } from "@/types/geolocation";

// The seam between the two worlds this one bundle ships into: a Chrome MV3 extension (popup +
// background service worker) and a plain web page on GitHub Pages. Everything here is feature-detected,
// so on Pages - where there is no `chrome` - every function is a safe no-op.

// The slice of state the background worker needs to fetch and notify with the popup closed. The popup
// stays the source of truth on localStorage (which also keeps Pages synchronous and simple); in the
// extension it mirrors this slice into chrome.storage.local, because a service worker has neither
// localStorage nor any access to the popup's in-memory Zustand stores.
export interface WeatherSyncState {
    readonly geolocation: CityGeolocation | null;
    readonly showNotifications: boolean;
}

const SYNC_KEY = "weather-sync-state";
const LAST_NOTIFIED_KEY = "weather-last-notified-ymd";

// True inside an extension page or worker, false on a normal web page. `chrome.runtime?.id` is the
// reliable tell: the bare `chrome` object leaks into ordinary pages in some browsers, but only an
// actual extension context carries a runtime id.
export function isExtension(): boolean {
    return typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
}

// An asset URL that resolves in both worlds: chrome-extension://<id>/<path> in the extension, and a
// relative path on Pages. Used for notification icons, which must be a packaged resource - a remote
// URL never loads in chrome.notifications.
export function extensionAssetUrl(path: string): string {
    return isExtension() ? chrome.runtime.getURL(path) : `./${path}`;
}

// Popup -> storage. No-op on Pages.
export async function writeWeatherSyncState(state: WeatherSyncState): Promise<void> {
    if (!isExtension()) return;
    await chrome.storage.local.set({ [SYNC_KEY]: state });
}

// Worker -> storage. null when the popup has never run, so nothing has been written yet.
export async function readWeatherSyncState(): Promise<WeatherSyncState | null> {
    if (!isExtension()) return null;
    const stored = await chrome.storage.local.get(SYNC_KEY);
    return (stored[SYNC_KEY] as WeatherSyncState | undefined) ?? null;
}

// The dedup marker for the once-per-calendar-day notification.
export async function readLastNotifiedYmd(): Promise<string | null> {
    if (!isExtension()) return null;
    const stored = await chrome.storage.local.get(LAST_NOTIFIED_KEY);
    return (stored[LAST_NOTIFIED_KEY] as string | undefined) ?? null;
}

export async function writeLastNotifiedYmd(ymd: string): Promise<void> {
    if (!isExtension()) return;
    await chrome.storage.local.set({ [LAST_NOTIFIED_KEY]: ymd });
}
