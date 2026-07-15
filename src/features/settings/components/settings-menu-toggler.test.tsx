import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import SettingsMenuToggler from "@/features/settings/components/settings-menu-toggler";
import { useUiStore } from "@/stores/ui-store";

describe("SettingsMenuToggler", () => {
    it("shows the gear while settings are closed", () => {
        const { container } = render(<SettingsMenuToggler />);

        expect(container.querySelector("svg.bi-gear")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
    });

    it("swaps to the close icon once settings are open", () => {
        act(() => useUiStore.getState().openPanel("settings"));

        const { container } = render(<SettingsMenuToggler />);

        expect(container.querySelector("svg.bi-x-lg")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close settings" })).toBeInTheDocument();
    });

    it("opens settings on click", async () => {
        const user = userEvent.setup();
        render(<SettingsMenuToggler />);

        await user.click(screen.getByRole("button"));

        expect(useUiStore.getState().activePanel).toBe("settings");
    });

    // This is what used to be a manual setShowCitySearchMenu(false) reaching into the city
    // feature's store from a settings component.
    it("opening settings closes the city search", async () => {
        const user = userEvent.setup();
        act(() => useUiStore.getState().openPanel("city-search"));
        render(<SettingsMenuToggler />);

        await user.click(screen.getByRole("button"));

        expect(useUiStore.getState().activePanel).toBe("settings");
    });

    it("clicking again closes settings", async () => {
        const user = userEvent.setup();
        act(() => useUiStore.getState().openPanel("settings"));
        render(<SettingsMenuToggler />);

        await user.click(screen.getByRole("button"));

        expect(useUiStore.getState().activePanel).toBe("none");
    });
});
