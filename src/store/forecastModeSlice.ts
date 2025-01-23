import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: string = "temperature"

const forecastModeSlice = createSlice({
    name: "forecastMode",
    initialState: initialState,
    reducers: {
        setForecastMode: (state, action: PayloadAction<string>) => action.payload
    }
})

export const { setForecastMode } = forecastModeSlice.actions
export default forecastModeSlice.reducer