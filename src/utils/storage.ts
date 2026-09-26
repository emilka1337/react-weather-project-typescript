// One place for "read JSON out of localStorage without exploding". The same try/catch/removeItem
// block was copy-pasted into the settings store, the starred-cities store, the forecast cache and
// the city-name cache.

export function readJson<T>(key: string): T | null {
    const raw = localStorage.getItem(key);

    if (raw === null) return null;

    try {
        return JSON.parse(raw) as T;
    } catch (error) {
        // A corrupted value is not recoverable, and keeping it means failing again on every load.
        console.error(`Dropping corrupted localStorage entry "${key}": `, error);
        localStorage.removeItem(key);

        return null;
    }
}

export function writeJson(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // setItem throws on quota-exceeded or when storage is disabled/blocked (private modes). A
        // lost cache write or settings-persist is not worth crashing a click handler or an async
        // .then over - readJson simply won't find it next time.
        console.error(`Failed to write localStorage entry "${key}": `, error);
    }
}

export function removeItem(key: string): void {
    localStorage.removeItem(key);
}
