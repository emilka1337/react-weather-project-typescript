import { createSlice } from "@reduxjs/toolkit";

const forecastSlice = createSlice({
    name: "forecast",
    initialState: {
        list: []
    },
    reducers: {
        setForecast: (state, action) => {
            console.log(action.payload);
            return action.payload
        }
    }
})

export const { setForecast } = forecastSlice.actions
export default forecastSlice.reducer