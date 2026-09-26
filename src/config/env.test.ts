import { describe, expect, it } from "vitest";

import { EnvSchema } from "@/config/env";

const valid = {
    VITE_BASE_URL: "https://api.openweathermap.org/",
    VITE_API_KEY: "key",
};

describe("EnvSchema", () => {
    it("accepts a well-formed environment", () => {
        expect(EnvSchema.safeParse(valid).success).toBe(true);
    });

    // ky 2 joins `prefix` and the path with exactly one slash, so the trailing slash is optional.
    it("accepts a base URL without a trailing slash", () => {
        expect(
            EnvSchema.safeParse({ ...valid, VITE_BASE_URL: "https://api.openweathermap.org" }).success,
        ).toBe(true);
    });

    it("rejects a base URL that is not an http(s) URL", () => {
        for (const VITE_BASE_URL of ["api.openweathermap.org", "ftp://api.openweathermap.org/", ""]) {
            const result = EnvSchema.safeParse({ ...valid, VITE_BASE_URL });

            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toContain("http(s) URL");
        }
    });

    it("rejects an empty API key, rather than 401ing later", () => {
        expect(EnvSchema.safeParse({ ...valid, VITE_API_KEY: "" }).success).toBe(false);
    });

    it("rejects a missing variable", () => {
        expect(EnvSchema.safeParse({ VITE_BASE_URL: valid.VITE_BASE_URL }).success).toBe(false);
    });
});
