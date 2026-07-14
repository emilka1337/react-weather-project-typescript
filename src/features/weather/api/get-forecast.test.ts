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

    it("returns the parsed payload", async () => {
        const forecast = await getForecast(BAKU);

        expect(forecast.list).toHaveLength(40);
        expect(forecast.city.name).toBe("Baku");
    });

    it("rejects on an HTTP error rather than swallowing it", async () => {
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 429 })));

        await expect(getForecast(BAKU)).rejects.toThrow();
    });
});
