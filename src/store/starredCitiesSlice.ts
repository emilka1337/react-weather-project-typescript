import { createSlice } from "@reduxjs/toolkit";
import { SearchCity } from "../types/SearchCity";

let localSavedCities: string | null = localStorage.getItem("starredCities");
let parsedCities: SearchCity[] | undefined;

if (localSavedCities) {
    parsedCities = JSON.parse(localSavedCities)
} else {
    parsedCities = []
}

const starredCitiesSlice = createSlice({
    name: "starredCities",
    initialState: parsedCities,
    reducers: {
        addCityToStarredCities(state, payload): void | undefined {
            if (! state) return
            state.push(payload.payload)
            localStorage.setItem("starredCities", JSON.stringify(state))
        },
        removeCityFromStarredCities(state, payload): void | undefined {
            if (! state) return
            state.splice(payload.payload, 1)
            localStorage.setItem("starredCities", JSON.stringify(state))
        }
    }
})

export const { addCityToStarredCities, removeCityFromStarredCities } = starredCitiesSlice.actions
export default starredCitiesSlice.reducer