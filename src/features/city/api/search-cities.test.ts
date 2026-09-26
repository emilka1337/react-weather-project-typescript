import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { searchCities } from "@/features/city/api/search-cities";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/geo/1.0/direct";

describe("searchCities", () => {
    it("URL-encodes the query, which the hand-built URL had to do by hand", async () => {
        let sent: URLSearchParams | undefined;

        server.use(
            http.get(ENDPOINT, ({ request }) => {
                sent = new URL(request.url).searchParams;
                return HttpResponse.json([]);
            })
        );

        await searchCities("São Paulo & Rio");

        expect(sent?.get("q")).toBe("São Paulo & Rio");
        expect(sent?.get("limit")).toBe("3");
        expect(sent?.get("appid")).toBe("test-api-key");
    });

    it("returns the matched cities", async () => {
        const baku = { name: "Baku", country: "AZ", lat: 40.37, lon: 49.89 };
        server.use(http.get(ENDPOINT, () => HttpResponse.json([baku])));

        await expect(searchCities("Bak")).resolves.toEqual([baku]);
    });

    it("rejects a malformed city at the boundary", async () => {
        // Missing lat/lon - the raw cast would have handed this straight to setGeolocation.
        server.use(http.get(ENDPOINT, () => HttpResponse.json([{ name: "Baku", country: "AZ" }])));

        await expect(searchCities("Bak")).rejects.toThrow();
    });

    it("rejects when its abort signal fires", async () => {
        const controller = new AbortController();
        server.use(http.get(ENDPOINT, () => HttpResponse.json([])));

        const pending = searchCities("Baku", { signal: controller.signal });
        controller.abort();

        await expect(pending).rejects.toThrow();
    });
});
