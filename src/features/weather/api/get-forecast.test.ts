import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getForecast } from "@/features/weather/api/get-forecast";
import { makeForecast } from "@/testing/fixtures/forecast";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/data/2.5/forecast";
const BAKU = { lat: 40.37, lon: 49.89 };

describe("getForecast", () => {
    it("requests metric units for the given coordinates, with the appid merged in", async () => {
        let sent: URLSearchParams | undefined;

        server.use(
            http.get(ENDPOINT, ({ request }) => {
                sent = new URL(request.url).searchParams;
                return HttpResponse.json({ city: {}, cnt: 40, cod: "200", list: makeForecast() });
            })
        );

        await getForecast(BAKU);

        expect(sent?.get("lat")).toBe("40.37");
        expect(sent?.get("lon")).toBe("49.89");
        expect(sent?.get("units")).toBe("metric");
        expect(sent?.get("appid")).toBe("test-api-key");
    });

    it("returns the parsed payload, keeping only the validated fields", async () => {
        const forecast = await getForecast(BAKU);

        expect(forecast.list).toHaveLength(40);
        // city/cnt/cod are stripped by the schema - only `list` is consumed.
        expect(forecast).not.toHaveProperty("city");
    });

    it("rejects on an HTTP error rather than swallowing it", async () => {
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 429 })));

        await expect(getForecast(BAKU)).rejects.toThrow();
    });

    it("rejects a malformed payload at the boundary instead of letting it crash rendering", async () => {
        // A unit missing `main` - the kind of shape a raw cast would have waved through, only to
        // explode later on forecast[i].main.temp.
        server.use(
            http.get(ENDPOINT, () =>
                HttpResponse.json({ list: [{ dt: 1, wind: { speed: 1, deg: 1 }, weather: [{ main: "Clear" }] }] })
            )
        );

        await expect(getForecast(BAKU)).rejects.toThrow();
    });
});
