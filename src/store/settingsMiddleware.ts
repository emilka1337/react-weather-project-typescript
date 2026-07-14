import { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { Settings } from "../types/Settings";
import { ReduxState } from "../types/State";

const saveSettings = (settings: Settings): void => {
    localStorage.setItem("weather-app-settings", JSON.stringify(settings));
};

const settingsMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    const { type } = action as UnknownAction;

    if (typeof type !== "string" || !type.startsWith("settings/")) return result;

    if (type === "settings/resetSettings") {
        localStorage.removeItem("weather-app-settings");
    } else {
        saveSettings((store.getState() as ReduxState).settings);
    }

    return result;
};

export default settingsMiddleware;
