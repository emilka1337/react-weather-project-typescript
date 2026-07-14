import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ForecastUnit } from "../types/ForecastUnit";

const initialState: ForecastUnit[] = []

const forecastSlice = createSlice({
    name: "forecast",
    initialState: initialState,
    reducers: {
        // Typed on purpose: an untyped action let a whole ForecastData object be stored here
        // instead of its `list`, which the array consumers then crashed on.
        setForecast: (_state, action: PayloadAction<ForecastUnit[]>): ForecastUnit[] => action.payload
    }
})

export const { setForecast } = forecastSlice.actions
export default forecastSlice.reducer