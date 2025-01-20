import { createSlice } from "@reduxjs/toolkit";

const geolocationSlice = createSlice({
    name: "geolocation",
    initialState: {
        lat: 0,
        lon: 0
    },
    reducers: {
        setGeolocation(state, action) {
            if (action.payload.lat && action.payload.lon) {
                state.lat = action.payload.lat;
                state.lon = action.payload.lon;
            }
        }
    }
})

export const { setGeolocation } = geolocationSlice.actions;
export default geolocationSlice.reducer