import { createSlice } from "@reduxjs/toolkit";

const starredCitiesSlice = createSlice({
    name: "starredCities",
    initialState: JSON.parse(localStorage.getItem("starredCities")) || [],
    reducers: {
        addCityToStarredCities(state, payload) {
            state.push(payload.payload)
            localStorage.setItem("starredCities", JSON.stringify(state))
        },
        removeCityFromStarredCities(state, payload) {
            state.splice(payload.payload, 1)
            localStorage.setItem("starredCities", JSON.stringify(state))
        }
    }
})

export const { addCityToStarredCities, removeCityFromStarredCities } = starredCitiesSlice.actions
export default starredCitiesSlice.reducer