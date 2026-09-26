import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { readUsableForecast, saveForecast } from "@/features/weather/api/forecast-cache";
import useForecast from "@/features/weather/hooks/use-forecast";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import type { ForecastData } from "@/features/weather/types/forecast-data";
import { makeForecast } from "@/testing/fixtures/forecast";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/data/2.5/forecast";

// Counts forecast requests while still answering them like the default handler.
const countForecastRequests = (respond: () => Response = () => HttpResponse.json(payload())) => {
    const counter = { requests: 0 };
    server.use(
        http.get(ENDPOINT, () => {
            counter.requests += 1;
            return respond();
        }),
    );
    return counter;
};

const payload = (): ForecastData =>
    ({ city: { name: "Baku", coord: BAKU }, cnt: 40, cod: "200", list: makeForecast() }) as ForecastData;

describe("useForecast", () => {
    it("does nothing until there are coordinates", async () => {
        const counter = countForecastRequests();

        renderHook(() => useForecast({ lat: 0, lon: 0 }));

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(counter.requests).toBe(0);
        expect(useForecastStore.getState().forecast).toEqual([]);
    });

    it("fetches the forecast, stores it, and caches it for the coordinates", async () => {
        const counter = countForecastRequests();

        renderHook(() => useForecast(BAKU));

        await waitFor(() => expect(useForecastStore.getState().forecast).toHaveLength(40));
        expect(counter.requests).toBe(1);
        expect(readUsableForecast(BAKU)?.list).toHaveLength(40);
    });

    it("serves a fresh cached forecast without touching the network", () => {
        saveForecast(payload(), BAKU);
        const counter = countForecastRequests();

        renderHook(() => useForecast(BAKU));

        expect(useForecastStore.getState().forecast).toHaveLength(40);
        expect(counter.requests).toBe(0);
    });

    it("logs a failed request and leaves the store as it was", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        countForecastRequests(() => new HttpResponse(null, { status: 401 }));

        renderHook(() => useForecast(BAKU));

        await waitFor(() =>
            expect(consoleError).toHaveBeenCalledWith("Failed to fetch forecast: ", expect.anything()),
        );
        expect(useForecastStore.getState().forecast).toEqual([]);
    });

    it("drops a response that arrives after the coordinates changed", async () => {
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => (release = resolve));
        server.use(
            http.get(ENDPOINT, async ({ request }) => {
                const lat = Number(new URL(request.url).searchParams.get("lat"));
                // Hold the first (Baku) response until the second request has been answered.
                if (lat === BAKU.lat) await gate;
                return HttpResponse.json({
                    ...payload(),
                    list: makeForecast().slice(0, lat === BAKU.lat ? 40 : 8),
                });
            }),
        );

        const { rerender } = renderHook(({ at }) => useForecast(at), { initialProps: { at: BAKU } });
        rerender({ at: { lat: 51.5, lon: -0.12 } });

        await waitFor(() => expect(useForecastStore.getState().forecast).toHaveLength(8));
        release();
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(useForecastStore.getState().forecast).toHaveLength(8);
    });
});
