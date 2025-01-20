import { createSlice } from "@reduxjs/toolkit";

const selectedCitySlice = createSlice({
    name: "selectedCity",
    initialState: "Loading...",
    reducers: {
        setSelectedCity: (state, action) => action.payload
    }
})

export const {setSelectedCity} = selectedCitySlice.actions
export default selectedCitySlice.reducer;