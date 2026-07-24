import { describe, expect, it } from "vitest";

import { useUiStore } from "@/stores/ui-store";

const panel = () => useUiStore.getState().activePanel;

describe("uiStore", () => {
    it("starts with no panel open", () => {
        expect(panel()).toBe("none");
    });

    it("opens a panel", () => {
        useUiStore.getState().openPanel("settings");

        expect(panel()).toBe("settings");
    });

    // The invariant that replaces the cross-feature write: settings-menu-toggler used to reach into
    // the city feature's store and call setShowCitySearchMenu(false) by hand before opening itself.
    it("opening settings closes the city search, and the other way round", () => {
        useUiStore.getState().openPanel("city-search");
        useUiStore.getState().openPanel("settings");

        expect(panel()).toBe("settings");

        useUiStore.getState().openPanel("city-search");

        expect(panel()).toBe("city-search");
    });

    it("toggles a panel shut when it is already the active one", () => {
        useUiStore.getState().togglePanel("settings");
        expect(panel()).toBe("settings");

        useUiStore.getState().togglePanel("settings");
        expect(panel()).toBe("none");
    });

    it("toggling a different panel switches to it rather than closing", () => {
        useUiStore.getState().togglePanel("settings");
        useUiStore.getState().togglePanel("city-search");

        expect(panel()).toBe("city-search");
    });

    it("closes whatever is open", () => {
        useUiStore.getState().openPanel("settings");
        useUiStore.getState().closePanel();

        expect(panel()).toBe("none");
    });
});
