import { LocalNames } from "@/features/city/types/local-names"

export interface SearchCity {
    readonly name: string
    readonly country: string
    readonly lat: number
    readonly lon: number
    readonly local_names: LocalNames
}