import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: string = "Loading"

const selectedCitySlice = createSlice({
    name: "selectedCity",
    initialState: initialState,
    reducers: {
        setSelectedCity: (state, action: PayloadAction<string>): string => action.payload
    }
})

export const {setSelectedCity} = selectedCitySlice.actions
export default selectedCitySlice.reducer;