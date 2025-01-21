import { createSlice } from "@reduxjs/toolkit";
import { Alert } from "../types/Alert";

interface AlertInitialState {
    errors: Alert[]
    warnings: Alert[]
}

const initialState: AlertInitialState = {
    errors: [],
    warnings: []
}

const alertsSlice = createSlice({
    name: "alerts",
    initialState: initialState,
    reducers: {
        addError(state, action): void {
            let errorName;

            switch (action.payload.error.code) {
                case 1: errorName = "Permission denied"; break;
                case 2: errorName = "Position unavailavle"; break;
                case 3: errorName = "Geolocation imeout"; break;
            }

            const error: Alert = {
                name: errorName,
                message: action.payload.error.message,
                code: action.payload.error.code
            }
            state.errors.push(error)
        },
        addWarning(state, action): void {
            state.warnings.push(action.payload.warningObject)
        }
    }
})

export const { addError, addWarning } = alertsSlice.actions;
export default alertsSlice.reducer