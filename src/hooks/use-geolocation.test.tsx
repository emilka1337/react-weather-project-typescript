import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useGeolocation from "@/hooks/use-geolocation";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { BAKU } from "@/testing/mocks/handlers";
import { server } from "@/testing/mocks/server";

const LONDON = { lat: 51.5074, lon: -0.1278 };

type Outcome = { position: { lat: number; lon: number } } | { error: string } | "pending";

// Replaces navigator.geolocation. "pending" never calls back, like a device that has no fix yet.
// Returns the callbacks so a test can deliver the answer later.
const mockBrowserGeolocation = (outcome: Outcome) => {
    const calls: { success: PositionCallback; failure: PositionErrorCallback }[] = [];

    vi.stubGlobal("navigator", {
        geolocation: {
            getCurrentPosition: (success: PositionCallback, failure: PositionErrorCallback) => {
                calls.push({ success, failure });
                if (outcome === "pending") return;
                if ("position" in outcome) {
                    const coords = { latitude: outcome.position.lat, longitude: outcome.position.lon };
                    success({ coords, timestamp: 0 } as GeolocationPosition);
                } else {
                    failure({ code: 1, message: outcome.error } as GeolocationPositionError);
                }
            },
        },
    });

    return calls;
};

describe("useGeolocation", () => {
    beforeEach(() => {
        vi.spyOn(console, "info").mockImplementation(() => undefined);
    });

    it("stores the browser's position and returns it", async () => {
        mockBrowserGeolocation({ position: LONDON });

        const { result } = renderHook(() => useGeolocation());

        await waitFor(() => expect(result.current).toEqual(LONDON));
        expect(useGeolocationStore.getState().geolocation).toEqual(LONDON);
    });

    it("falls back to IP geolocation when the user denies the browser prompt", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mockBrowserGeolocation({ error: "denied" });

        const { result } = renderHook(() => useGeolocation());

        await waitFor(() => expect(result.current).toEqual(BAKU));
        expect(consoleError).toHaveBeenCalledWith("Geolocation API error: ", expect.anything());
    });

    it("falls back to IP geolocation when the browser has no geolocation API at all", async () => {
        vi.stubGlobal("navigator", {});

        const { result } = renderHook(() => useGeolocation());

        await waitFor(() => expect(result.current).toEqual(BAKU));
        expect(console.info).toHaveBeenCalledWith("[geo] navigator.geolocation unavailable");
    });

    it("keeps the empty position when the IP fallback fails too", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        server.use(http.get("https://ipapi.co/json/", () => new HttpResponse(null, { status: 500 })));
        vi.stubGlobal("navigator", {});

        const { result } = renderHook(() => useGeolocation());

        await waitFor(() => expect(console.error).toHaveBeenCalled());
        expect(result.current).toEqual({ lat: 0, lon: 0 });
    });

    it("ignores a position that arrives after unmount", () => {
        const calls = mockBrowserGeolocation("pending");
        const { unmount } = renderHook(() => useGeolocation());

        unmount();
        calls[0].success({
            coords: { latitude: LONDON.lat, longitude: LONDON.lon },
            timestamp: 0,
        } as GeolocationPosition);

        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 0, lon: 0 });
    });

    it("ignores an IP fallback that resolves after unmount", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => (release = resolve));
        server.use(
            http.get("https://ipapi.co/json/", async () => {
                await gate;
                return HttpResponse.json({ latitude: BAKU.lat, longitude: BAKU.lon });
            }),
        );
        const calls = mockBrowserGeolocation("pending");
        const { unmount } = renderHook(() => useGeolocation());

        calls[0].failure({ code: 3, message: "timeout" } as GeolocationPositionError);
        unmount();
        release();

        await waitFor(() => expect(console.info).toHaveBeenCalledWith("[geo] using IP-based fallback"));
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(useGeolocationStore.getState().geolocation).toEqual({ lat: 0, lon: 0 });
    });

    it("asks with a timeout, so the fallback can run on a device that never gets a fix", () => {
        const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>();
        vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

        renderHook(() => useGeolocation());

        expect(getCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            expect.objectContaining({ timeout: 10_000 }),
        );
    });
});
