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

    // Every request path is appended without a leading slash, so a base URL without the trailing
    // slash silently produces "...openweathermap.orgdata/2.5/forecast".
    it("rejects a base URL with no trailing slash", () => {
        const result = EnvSchema.safeParse({ ...valid, VITE_BASE_URL: "https://api.openweathermap.org" });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toContain("trailing slash");
    });

    it("rejects an empty API key, rather than 401ing later", () => {
        expect(EnvSchema.safeParse({ ...valid, VITE_API_KEY: "" }).success).toBe(false);
    });

    it("rejects a missing variable", () => {
        expect(EnvSchema.safeParse({ VITE_BASE_URL: valid.VITE_BASE_URL }).success).toBe(false);
    });
});
