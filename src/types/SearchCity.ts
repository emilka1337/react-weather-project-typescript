import { LocalNames } from "./LocalNames"

export interface SearchCity {
    readonly name: string
    readonly country: string
    readonly lat: number
    readonly lon: number
    readonly local_names: LocalNames
}