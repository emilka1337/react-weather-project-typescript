import React, { useCallback, useState } from "react";
import { Settings } from "@/types/settings";
import { useSettingsStore } from "@/stores/settings-store";

function SettingsMenu() {
    const [settingsResetted, setSettingsResetted] = useState<boolean>(false);

    const settings: Settings = useSettingsStore((state) => state.settings);
    // Read from the store, not passed down: app.tsx had to subscribe to a settings primitive just
    // to hand it to a component that already reads the settings store.
    const showSettings: boolean = useSettingsStore((state) => state.settings.showSettings);

    const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
    const toggleLoadingAnimation = useSettingsStore((state) => state.toggleLoadingAnimation);
    const toggleFeelsLikeField = useSettingsStore((state) => state.toggleFeelsLikeField);
    const toggleTemperatureScale = useSettingsStore((state) => state.toggleTemperatureScale);
    const toggleSpeedUnit = useSettingsStore((state) => state.toggleSpeedUnit);
    const toggleSecondsInClocks = useSettingsStore((state) => state.toggleSecondsInClocks);
    const toggleNotifications = useSettingsStore((state) => state.toggleNotifications);
    const resetSettings = useSettingsStore((state) => state.resetSettings);

    //#region Settings click event listeners
    const resetSettingsClick = useCallback((): void => {
        resetSettings();
        setSettingsResetted(true);
        setTimeout(() => setSettingsResetted(false), 3000);
    }, [resetSettings]);

    const resetAppClick = useCallback((): void => {
        localStorage.clear();
        window.location.reload();
    }, []);
    //#endregion

    return (
        <div className={showSettings ? "settings-menu show" : "settings-menu"}>
            <ul>
                <li onClick={toggleDarkMode}>
                    <h5>Dark mode</h5>
                    <button className={settings.darkMode ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleLoadingAnimation}>
                    <h5>Loading animation</h5>
                    <button className={settings.loadingAnimation ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleFeelsLikeField}>
                    <h5>&quot;Feels like&quot; field</h5>
                    <button className={settings.showFeelsLikeField ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleTemperatureScale}>
                    <h5>Temperature in F°</h5>
                    <button className={settings.temperatureInF == true ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleSpeedUnit}>
                    <h5>Wind speed in m/s</h5>
                    <button className={settings.speedUnitInMS == true ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleSecondsInClocks}>
                    <h5>Show seconds in clocks</h5>
                    <button className={settings.showSecondsInClocks ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={toggleNotifications}>
                    <h5>Show notifications</h5>
                    <button className={settings.showNotifications ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li>
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
                <li>
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
