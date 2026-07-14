import { beforeEach, describe, expect, it, vi } from "vitest";

import { readJson, removeItem, writeJson } from "@/utils/storage";

describe("storage", () => {
    beforeEach(() => localStorage.clear());

    it("round-trips a value", () => {
        writeJson("key", { a: 1, b: ["x"] });

        expect(readJson("key")).toEqual({ a: 1, b: ["x"] });
    });

    it("returns null for a key that was never written", () => {
        expect(readJson("missing")).toBeNull();
    });

    it("drops a corrupted entry instead of throwing, so the next load is clean", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        localStorage.setItem("key", "{not json");

        expect(readJson("key")).toBeNull();
        expect(localStorage.getItem("key")).toBeNull();
        expect(consoleError).toHaveBeenCalled();
    });

    it("removes a key", () => {
        writeJson("key", 1);
        removeItem("key");

        expect(readJson("key")).toBeNull();
    });
});
