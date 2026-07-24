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
        server.use(http.get(ENDPOINT, () => HttpResponse.json([{ name: "Baku", country: "AZ" }])));

        await expect(searchCities("Bak")).resolves.toEqual([{ name: "Baku", country: "AZ" }]);
    });

    it("rejects when its abort signal fires", async () => {
        const controller = new AbortController();
        server.use(http.get(ENDPOINT, () => HttpResponse.json([])));

        const pending = searchCities("Baku", { signal: controller.signal });
        controller.abort();

        await expect(pending).rejects.toThrow();
    });
});
