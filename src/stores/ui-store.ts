import { create } from "zustand";

// The widget has two overlay panels and they are mutually exclusive. That used to be enforced by
// hand: settings-menu-toggler (a settings component) reached into the city feature's store to call
// setShowCitySearchMenu(false) before opening itself, while city's Topbar imported a settings
// component - a dependency cycle between two features.
//
// Modelling "which panel is open" as one piece of shared app state makes the exclusion a property
// of the state rather than of a click handler, and the two features stop knowing about each other.
export type Panel = "none" | "city-search" | "settings";

interface UiStore {
    activePanel: Panel;
    openPanel: (panel: Panel) => void;
    closePanel: () => void;
    togglePanel: (panel: Panel) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
    activePanel: "none",

    openPanel: (activePanel: Panel) => set({ activePanel }),
    closePanel: () => set({ activePanel: "none" }),
    togglePanel: (panel: Panel) => set({ activePanel: get().activePanel === panel ? "none" : panel }),
}));
