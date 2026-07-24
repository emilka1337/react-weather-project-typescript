import { create } from "zustand";

import { Settings } from "@/types/settings";
import { readJson, removeItem, writeJson } from "@/utils/storage";

const STORAGE_KEY = "weather-app-settings";

const prefersDarkMode = (): boolean => window.matchMedia("(prefers-color-scheme: dark)").matches;

const defaultSettings = (): Settings => ({
    darkMode: prefersDarkMode(),
    loadingAnimation: true,
    showFeelsLikeField: false,
    temperatureInF: false,
    speedUnitInMS: false,
    showSecondsInClocks: false,
    showNotifications: false,
});

function loadSettings(): Settings {
    // Spread over the defaults so a settings key added after the user last saved is present
    // rather than undefined.
    return { ...defaultSettings(), ...readJson<Partial<Settings>>(STORAGE_KEY) };
}

const saveSettings = (settings: Settings): void => writeJson(STORAGE_KEY, settings);

interface SettingsStore {
    settings: Settings;
    toggleDarkMode: () => void;
    toggleLoadingAnimation: () => void;
    toggleFeelsLikeField: () => void;
    toggleTemperatureScale: () => void;
    toggleSpeedUnit: () => void;
    toggleSecondsInClocks: () => void;
    toggleNotifications: () => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
    // Replaces the old settingsMiddleware: every change writes through to localStorage,
    // in the same raw-object format, so settings saved by the Redux build still load.
    const update = (patch: Partial<Settings>): void => {
        const settings: Settings = { ...get().settings, ...patch };

        set({ settings });
        saveSettings(settings);
    };

    return {
        settings: loadSettings(),

        toggleDarkMode: () => update({ darkMode: !get().settings.darkMode }),
        toggleLoadingAnimation: () => update({ loadingAnimation: !get().settings.loadingAnimation }),
        toggleFeelsLikeField: () => update({ showFeelsLikeField: !get().settings.showFeelsLikeField }),
        toggleTemperatureScale: () => update({ temperatureInF: !get().settings.temperatureInF }),
        toggleSpeedUnit: () => update({ speedUnitInMS: !get().settings.speedUnitInMS }),
        toggleSecondsInClocks: () => update({ showSecondsInClocks: !get().settings.showSecondsInClocks }),
        toggleNotifications: () => update({ showNotifications: !get().settings.showNotifications }),

        resetSettings: () => {
            set({
                settings: {
                    ...get().settings,
                    darkMode: prefersDarkMode(),
                    showFeelsLikeField: false,
                    temperatureInF: false,
                    speedUnitInMS: false,
                    showSecondsInClocks: false,
                    showNotifications: false,
                },
            });

            // Deliberately not saveSettings(): a reset drops the persisted settings entirely,
            // so the next load starts from the defaults. Same as the old middleware did.
            removeItem(STORAGE_KEY);
        },
    };
});
