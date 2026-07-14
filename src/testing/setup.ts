import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Node 25 exposes its own partial `localStorage` global that shadows the jsdom one and has no
// clear(), so install a plain in-memory Storage instead of trusting whatever the runtime provides.
class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
        return this.store.size;
    }
    key(index: number): string | null {
        return [...this.store.keys()][index] ?? null;
    }
    getItem(key: string): string | null {
        return this.store.get(key) ?? null;
    }
    setItem(key: string, value: string): void {
        this.store.set(key, String(value));
    }
    removeItem(key: string): void {
        this.store.delete(key);
    }
    clear(): void {
        this.store.clear();
    }
}

const memoryStorage = new MemoryStorage();

vi.stubGlobal("localStorage", memoryStorage);
Object.defineProperty(window, "localStorage", { value: memoryStorage, configurable: true });

// jsdom implements neither of these, and settingsStore calls matchMedia at module load.
vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
);

vi.stubGlobal("Notification", {
    permission: "denied",
    requestPermission: vi.fn().mockResolvedValue("denied"),
});

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    cleanup();
});
