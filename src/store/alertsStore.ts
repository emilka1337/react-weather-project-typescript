import { create } from "zustand";
import { Alert } from "../types/Alert";

const geolocationErrorNames: Record<number, string> = {
    1: "Permission denied",
    2: "Position unavailavle",
    3: "Geolocation imeout",
};

interface AlertsStore {
    errors: Alert[];
    warnings: Alert[];
    addError: (error: GeolocationPositionError) => void;
    addWarning: (warning: Alert) => void;
}

export const useAlertsStore = create<AlertsStore>((set) => ({
    errors: [],
    warnings: [],

    addError: (error: GeolocationPositionError) =>
        set(({ errors }) => ({
            errors: [
                ...errors,
                {
                    name: geolocationErrorNames[error.code],
                    message: error.message,
                    code: error.code,
                },
            ],
        })),

    addWarning: (warning: Alert) => set(({ warnings }) => ({ warnings: [...warnings, warning] })),
}));
