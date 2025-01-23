import { createSlice } from "@reduxjs/toolkit";
import { ForecastUnit } from "../types/ForecastUnit";

const initialState: ForecastUnit[] = []

const forecastSlice = createSlice({
    name: "forecast",
    initialState: initialState,
    reducers: {
        setForecast: (state, action) => action.payload
    }
})

export const { setForecast } = forecastSlice.actions
export default forecastSlice.reducer