import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("env (module load)", () => {
    afterEach(() => vi.unstubAllEnvs());

    // The point of validating at import time: the app refuses to start with the reason spelled
    // out, instead of every request 401-ing later.
    it("throws on import, naming the bad variable, when the environment is invalid", async () => {
        vi.stubEnv("VITE_API_KEY", "");
        vi.resetModules();

        await expect(import("@/config/env")).rejects.toThrow(
            /Invalid environment variables[\s\S]*VITE_API_KEY/,
        );
    });

    it("exposes the parsed values when the environment is valid", async () => {
        vi.resetModules();

        const { env } = await import("@/config/env");

        expect(env.VITE_API_KEY).toBe("test-api-key");
    });
});
