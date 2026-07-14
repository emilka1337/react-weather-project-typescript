import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGeolocationByIp } from "@/lib/ip-geolocation";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://ipapi.co/json/";

describe("getGeolocationByIp", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("maps latitude/longitude onto the app's lat/lon shape", async () => {
        await expect(getGeolocationByIp()).resolves.toEqual({ lat: 40.37, lon: 49.89 });
    });

    // It runs inside a Geolocation error callback, where a rejected promise has nowhere to be
    // caught. Returning null instead of throwing is the contract, so all three failure modes below
    // must resolve, not reject.
    it("returns null, not a rejection, when the response is missing coordinates", async () => {
        server.use(http.get(ENDPOINT, () => HttpResponse.json({ city: "Baku" })));

        await expect(getGeolocationByIp()).resolves.toBeNull();
    });

    it("returns null when latitude is not a number", async () => {
        server.use(http.get(ENDPOINT, () => HttpResponse.json({ latitude: "40.37", longitude: 49.89 })));

        await expect(getGeolocationByIp()).resolves.toBeNull();
    });

    it("returns null on an HTTP error", async () => {
        server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));

        await expect(getGeolocationByIp()).resolves.toBeNull();
    });
});
