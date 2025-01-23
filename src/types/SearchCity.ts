import { LocalNames } from "./LocalNames"

export interface SearchCity {
    name: string
    country: string
    lat: number
    lon: number
    local_names: LocalNames
}