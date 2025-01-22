import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    toggleDarkMode,
    toggleFeelsLikeField,
    toggleSecondsInClocks,
    toggleSpeedUnit,
    toggleTemperatureScale,
    resetSettings,
} from "../../store/settingsSlice";
import { Settings } from "../../types/Settings";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";

interface SettingsMenuProps {
    showSettings: boolean;
}

function SettingsMenu({ showSettings }: SettingsMenuProps) {
    let [settingsResetted, setSettingsResetted] = useState<boolean>(false);

    const dispatch: AppDispatch = useDispatch();
    const settings: Settings = useSelector((state: ReduxState) => state.settings);

    //#region Settings click event listeners
    const darkModeSettingClick = (): void => {
        dispatch(toggleDarkMode());
    };

    const feelsLikeSettingClick = (): void => {
        dispatch(toggleFeelsLikeField());
    };

    const temperatureScaleSettingClick = (): void => {
        dispatch(toggleTemperatureScale());
    };

    const speedUnitSettingClick = (): void => {
        dispatch(toggleSpeedUnit());
    };

    const showSecondsInClocksClick = (): void => {
        dispatch(toggleSecondsInClocks());
    };

    const resetSettingsClick = (): void => {
        dispatch(resetSettings());
        setSettingsResetted(true);
        setTimeout(() => setSettingsResetted(false), 3000);
    };

    const resetAppClick = (): void => {
        localStorage.clear();
        window.location.reload();
    };
    //#endregion

    return (
        <div className={showSettings ? "settings-menu show" : "settings-menu"}>
            <ul>
                <li onClick={darkModeSettingClick}>
                    <h5>Dark mode</h5>
                    <button className={settings.darkMode ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={feelsLikeSettingClick}>
                    <h5>&quot;Feels like&quot; field</h5>
                    <button className={settings.showFeelsLikeField ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={temperatureScaleSettingClick}>
                    <h5>Temperature in F°</h5>
                    <button className={settings.temperatureInF == true ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={speedUnitSettingClick}>
                    <h5>Wind speed in m/s</h5>
                    <button className={settings.speedUnitInMS == true ? "toggler toggled" : "toggler"}>
                        <div className="circle"></div>
                    </button>
                </li>
                <li onClick={showSecondsInClocksClick}>
                    <h5>Show seconds in clocks</h5>
                    <button className={settings.showSecondsInClocks ? "toggler toggled" : "toggler"}>
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
