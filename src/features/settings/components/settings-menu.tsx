import React, { useCallback, useState } from "react";

import SettingToggle from "@/features/settings/components/setting-toggle";
import { clearExtensionStorage } from "@/lib/extension";
import { useSettingsStore } from "@/stores/settings-store";
import { useUiStore } from "@/stores/ui-store";
import { Settings } from "@/types/settings";

function SettingsMenu() {
    const [settingsResetted, setSettingsResetted] = useState<boolean>(false);

    const settings: Settings = useSettingsStore((state) => state.settings);
    // Which panel is open is app UI state, not a persisted user preference. It used to be a
    // showSettings flag inside the saved Settings object, so closing the tab with the menu open
    // persisted that and reopened the menu on the next load.
    const showSettings: boolean = useUiStore((state) => state.activePanel === "settings");

    const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
    const toggleLoadingAnimation = useSettingsStore((state) => state.toggleLoadingAnimation);
    const toggleFeelsLikeField = useSettingsStore((state) => state.toggleFeelsLikeField);
    const toggleTemperatureScale = useSettingsStore((state) => state.toggleTemperatureScale);
    const toggleSpeedUnit = useSettingsStore((state) => state.toggleSpeedUnit);
    const toggleSecondsInClocks = useSettingsStore((state) => state.toggleSecondsInClocks);
    const toggleNotifications = useSettingsStore((state) => state.toggleNotifications);
    const resetSettings = useSettingsStore((state) => state.resetSettings);

    const resetSettingsClick = useCallback((): void => {
        resetSettings();
        setSettingsResetted(true);
        setTimeout(() => setSettingsResetted(false), 3000);
    }, [resetSettings]);

    const resetAppClick = useCallback((): void => {
        localStorage.clear();
        // In the extension, also wipe the worker's chrome.storage mirror; no-op on Pages. Dispatched
        // before reload - the browser process handles it independently of the popup's lifecycle.
        void clearExtensionStorage();
        window.location.reload();
    }, []);

    return (
        <div className={showSettings ? "settings-menu show" : "settings-menu"}>
            <ul>
                <SettingToggle label="Dark mode" checked={settings.darkMode} onToggle={toggleDarkMode} />
                <SettingToggle
                    label="Loading animation"
                    checked={settings.loadingAnimation}
                    onToggle={toggleLoadingAnimation}
                />
                <SettingToggle
                    label='"Feels like" field'
                    checked={settings.showFeelsLikeField}
                    onToggle={toggleFeelsLikeField}
                />
                <SettingToggle
                    label="Temperature in F°"
                    checked={settings.temperatureInF}
                    onToggle={toggleTemperatureScale}
                />
                <SettingToggle
                    label="Wind speed in m/s"
                    checked={settings.speedUnitInMS}
                    onToggle={toggleSpeedUnit}
                />
                <SettingToggle
                    label="Show seconds in clocks"
                    checked={settings.showSecondsInClocks}
                    onToggle={toggleSecondsInClocks}
                />
                <SettingToggle
                    label="Show notifications"
                    checked={settings.showNotifications}
                    onToggle={toggleNotifications}
                />
                <li className="reset-row">
                    <h5>
                        Reset Settings <br />
                        <span>(Try this if something not working properly)</span>
                    </h5>
                    <button
                        className={settingsResetted ? "reset-button resetted" : "reset-button"}
                        onClick={resetSettingsClick}
                    >
                        {settingsResetted ? "OK" : "Reset"}
                    </button>
                </li>
                <li className="reset-row">
                    <h5>
                        Reset App <br />
                        <span>(Resets app settings, clears app local storage and reloads the page)</span>
                    </h5>
                    <button className="reset-button" onClick={resetAppClick}>
                        Reset
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default React.memo(SettingsMenu);
