import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getCityNameByCoords, reverseGeocode } from "@/features/city/api/reverse-geocode";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/geo/1.0/reverse";
const BAKU = { lat: 40.37, lon: 49.89 };

describe("reverseGeocode", () => {
    it("sends the coordinates, a limit, and the appid merged in by the api client", async () => {
        let sent: URLSearchParams | undefined;

        server.use(
            http.get(ENDPOINT, ({ request }) => {
                sent = new URL(request.url).searchParams;
                return HttpResponse.json([{ name: "Baku", country: "AZ", lat: 40.37, lon: 49.89 }]);
            })
        );

        await reverseGeocode(BAKU);

        expect(sent?.get("lat")).toBe("40.37");
        expect(sent?.get("lon")).toBe("49.89");
        expect(sent?.get("limit")).toBe("5");
        // ky only deep-merges searchParams when the per-request value is a plain object. If that
        // ever regresses, appid silently vanishes and every request 401s.
        expect(sent?.get("appid")).toBe("test-api-key");
    });
});

describe("getCityNameByCoords", () => {
    it("returns the first city's name", async () => {
        server.use(
            http.get(ENDPOINT, () =>
                HttpResponse.json([
                    { name: "Baku", country: "AZ", lat: 40.37, lon: 49.89 },
                    { name: "Ganja", country: "AZ", lat: 40.68, lon: 46.36 },
                ])
            )
        );

        await expect(getCityNameByCoords(BAKU)).resolves.toBe("Baku");
    });

    // A 200 with [] is a valid answer - coordinates over the ocean. The caller wants a name or an
    // error, not an empty array it has to remember to check.
    it("rejects when the API returns 200 with an empty array", async () => {
        server.use(http.get(ENDPOINT, () => HttpResponse.json([])));

        await expect(getCityNameByCoords(BAKU)).rejects.toThrow("No city found");
    });

    it("rejects on an HTTP error", async () => {
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 401 })));

        await expect(getCityNameByCoords(BAKU)).rejects.toThrow();
    });
});
