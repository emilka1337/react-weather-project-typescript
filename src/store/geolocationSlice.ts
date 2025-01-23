import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CityGeolocation } from "../types/CityGeolocation";

const initialState: CityGeolocation = {
    lat: 0,
    lon: 0
}

const geolocationSlice = createSlice({
    name: "geolocation",
    initialState: initialState,
    reducers: {
        setGeolocation(state, action: PayloadAction<CityGeolocation>): void {
            if (action.payload.lat && action.payload.lon) {
                state.lat = action.payload.lat;
                state.lon = action.payload.lon;
            }
        }
    }
})

export const { setGeolocation } = geolocationSlice.actions;
export default geolocationSlice.reducer