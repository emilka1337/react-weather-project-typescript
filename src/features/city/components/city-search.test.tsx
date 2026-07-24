import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CitySearch from "@/features/city/components/city-search";
import { useUiStore } from "@/stores/ui-store";
import { server } from "@/testing/mocks/server";

const ENDPOINT = "https://api.openweathermap.org/geo/1.0/direct";
const WAIT = { timeout: 3000 };

const searchInput = (): HTMLElement => screen.getByPlaceholderText("Search city...");

const renderSearch = () => {
    const user = userEvent.setup();
    render(<CitySearch />);

    return user;
};

const returns = (...names: string[]): void => {
    server.use(
        http.get(ENDPOINT, () =>
            HttpResponse.json(names.map((name) => ({ name, country: "AZ", lat: 1, lon: 1 })))
        )
    );
};

describe("CitySearch", () => {
    // Unconditional: a fake-timer test that fails mid-way would otherwise leave the timers faked
    // and hang every test after it.
    afterEach(() => vi.useRealTimers());

    it("is hidden until the city-search panel is the active one", () => {
        const { container } = render(<CitySearch />);

        expect(container.querySelector(".city-search")).not.toHaveClass("show");

        act(() => useUiStore.getState().openPanel("city-search"));

        expect(container.querySelector(".city-search")).toHaveClass("show");
    });

    it("closes the panel from the close button", async () => {
        act(() => useUiStore.getState().openPanel("city-search"));
        const user = renderSearch();

        await user.click(screen.getByRole("button", { name: "Close city search" }));

        expect(useUiStore.getState().activePanel).toBe("none");
    });

    it("moves focus into the search box when the panel opens, ready to type", () => {
        act(() => useUiStore.getState().openPanel("city-search"));

        render(<CitySearch />);

        expect(screen.getByRole("textbox", { name: "Search city" })).toHaveFocus();
    });

    it("does not search until the input has been quiet for 500ms", async () => {
        vi.useFakeTimers();
        let requests = 0;
        server.use(
            http.get(ENDPOINT, () => {
                requests += 1;
                return HttpResponse.json([]);
            })
        );

        render(<CitySearch />);
        // fireEvent, not user-event: user-event drives its own timers, and pairing it with fake
        // ones here buys nothing - the assertion is about the debounce, not about keystrokes.
        fireEvent.change(searchInput(), { target: { value: "Bak" } });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(499);
        });
        expect(requests).toBe(0);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1);
        });
        expect(requests).toBe(1);
    });

    it("shows the matched cities", async () => {
        returns("Baku");
        const user = renderSearch();

        await user.type(searchInput(), "Bak");

        expect(await screen.findByText("Baku, AZ", {}, WAIT)).toBeInTheDocument();
    });

    // city-search's comment claims the in-flight request is aborted so a slow earlier response
    // cannot land last and overwrite a newer one. Nothing proved it until now.
    it("aborts the in-flight request when the query changes, so a stale response cannot win", async () => {
        const started: string[] = [];
        const aborted: string[] = [];

        server.use(
            http.get(ENDPOINT, async ({ request }) => {
                const query = new URL(request.url).searchParams.get("q") ?? "";

                started.push(query);
                request.signal.addEventListener("abort", () => aborted.push(query));

                // The first query answers slowly, the second one instantly.
                await delay(query === "Bak" ? 2000 : 0);

                return HttpResponse.json([{ name: query, country: "AZ", lat: 1, lon: 1 }]);
            })
        );

        const user = renderSearch();
        await user.type(searchInput(), "Bak");

        // The debounce must actually elapse and the slow request must be in flight - otherwise the
        // timer is simply cancelled and this proves nothing about aborting.
        await waitFor(() => expect(started).toContain("Bak"), WAIT);

        await user.type(searchInput(), "u");

        // The newer query's result is what is on screen...
        expect(await screen.findByText("Baku, AZ", {}, WAIT)).toBeInTheDocument();
        // ...and the slow first request was actually cancelled, not merely ignored.
        await waitFor(() => expect(aborted).toContain("Bak"), WAIT);
        expect(screen.queryByText("Bak, AZ")).not.toBeInTheDocument();
    });

    it("clears the results when the input is emptied", async () => {
        returns("Baku");
        const user = renderSearch();

        await user.type(searchInput(), "Bak");
        expect(await screen.findByText("Baku, AZ", {}, WAIT)).toBeInTheDocument();

        await user.clear(searchInput());

        await waitFor(() => expect(screen.queryByText("Baku, AZ")).not.toBeInTheDocument(), WAIT);
    });
});
