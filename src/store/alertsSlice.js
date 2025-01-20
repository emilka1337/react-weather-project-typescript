import { createSlice } from "@reduxjs/toolkit";

const alertsSlice = createSlice({
    name: "alerts",
    initialState: {
        errors: [],
        warnings: []
    },
    reducers: {
        addError(state, action) {
            let errorName;

            switch (action.payload.error.code) {
                case 1: errorName = "Permission denied"; break;
                case 2: errorName = "Position unavailavle"; break;
                case 3: errorName = "Geolocation imeout"; break;
            }

            let error = { name: errorName, message: action.payload.error.message }
            state.errors.push(error)
        },
        addWarning(state, action) {
            state.alerts.warnings.push(action.payload.warningObject)
        }
    }
})

export const { addError, addWarning } = alertsSlice.actions;
export default alertsSlice.reducer