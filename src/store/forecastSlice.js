import { createSlice } from "@reduxjs/toolkit";

const forecastSlice = createSlice({
    name: "forecast",
    initialState: {
        list: []
    },
    reducers: {
        setForecast: (state, action) => {
            return action.payload.payload
        }
    }
})

export const { setForecast } = forecastSlice.actions
export default forecastSlice.reducer