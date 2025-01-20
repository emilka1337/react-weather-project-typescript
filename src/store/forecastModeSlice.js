import { createSlice } from "@reduxjs/toolkit";

const forecastModeSlice = createSlice({
    name: "forecastMode",
    initialState: "temperature",
    reducers: {
        setForecastMode: (state, action) => action.payload
    }
})

export const { setForecastMode } = forecastModeSlice.actions
export default forecastModeSlice.reducer