import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SettingsMenu from "@/features/settings/components/settings-menu";
import { useSettingsStore } from "@/stores/settings-store";
import { useUiStore } from "@/stores/ui-store";

const STORAGE_KEY = "weather-app-settings";

const settings = () => useSettingsStore.getState().settings;

describe("SettingsMenu", () => {
    afterEach(() => vi.useRealTimers());

    it("is hidden until settings is the active panel", () => {
        const { container } = render(<SettingsMenu />);

        expect(container.querySelector(".settings-menu")).not.toHaveClass("show");

        act(() => useUiStore.getState().openPanel("settings"));

        expect(container.querySelector(".settings-menu")).toHaveClass("show");
    });

    it.each([
        ["Dark mode", () => settings().darkMode],
        ["Loading animation", () => !settings().loadingAnimation], // starts on, so a click turns it off
        ['"Feels like" field', () => settings().showFeelsLikeField],
        ["Temperature in F°", () => settings().temperatureInF],
        ["Wind speed in m/s", () => settings().speedUnitInMS],
        ["Show seconds in clocks", () => settings().showSecondsInClocks],
        ["Show notifications", () => settings().showNotifications],
    ])("toggling %s flips its setting and persists it", async (label, isFlipped) => {
        const user = userEvent.setup();
        render(<SettingsMenu />);

        await user.click(screen.getByRole("switch", { name: label }));

        expect(isFlipped()).toBe(true);
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it("exposes each toggle as a switch whose aria-checked follows its setting", async () => {
        const user = userEvent.setup();
        render(<SettingsMenu />);

        const darkMode = screen.getByRole("switch", { name: "Dark mode" });
        expect(darkMode).toHaveAttribute("aria-checked", "false");

        await user.click(darkMode);

        expect(darkMode).toHaveAttribute("aria-checked", "true");
    });

    it("toggles from the keyboard with Space", async () => {
        const user = userEvent.setup();
        render(<SettingsMenu />);

        screen.getByRole("switch", { name: "Temperature in F°" }).focus();
        await user.keyboard(" ");

        expect(settings().temperatureInF).toBe(true);
    });

    it("reset restores the defaults and drops the persisted settings entirely", async () => {
        const user = userEvent.setup();
        render(<SettingsMenu />);

        await user.click(screen.getByText("Temperature in F°"));
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

        // There are two Reset buttons - settings, and the whole app. This is the first.
        await user.click(screen.getAllByRole("button", { name: "Reset" })[0]);

        expect(settings().temperatureInF).toBe(false);
        // Deliberate: a reset removes the key rather than saving the reset state.
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("acknowledges the reset for three seconds, then goes back to Reset", () => {
        vi.useFakeTimers();
        render(<SettingsMenu />);

        // fireEvent, not user-event: user-event drives its own timers and does not mix well with
        // fake ones. The assertion here is about the 3s window, not about the click.
        fireEvent.click(screen.getAllByRole("button", { name: "Reset" })[0]);

        expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByRole("button", { name: "OK" })).not.toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Reset" })).toHaveLength(2);
    });

    it("Reset App wipes storage and reloads the page", async () => {
        const reload = vi.fn();
        Object.defineProperty(window, "location", {
            value: { reload },
            writable: true,
            configurable: true,
        });
        const user = userEvent.setup();
        localStorage.setItem("something", "1");
        render(<SettingsMenu />);

        // The second "Reset" button is the Reset App one.
        await user.click(screen.getAllByRole("button", { name: "Reset" })[1]);

        expect(localStorage.getItem("something")).toBeNull();
        expect(reload).toHaveBeenCalled();
    });
});
