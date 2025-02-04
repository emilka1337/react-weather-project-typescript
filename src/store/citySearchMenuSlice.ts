import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: boolean = false

const showCitySearchMenu = createSlice({
    name: "showCitySearchMenu",
    initialState: initialState,
    reducers: {
        setShowCitySearchMenu: (state, action: PayloadAction<boolean>): boolean => action.payload
    }
})

export const { setShowCitySearchMenu } = showCitySearchMenu.actions
export default showCitySearchMenu.reducer;