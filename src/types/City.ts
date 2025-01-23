export interface City {
    readonly coord: {
        lat: number;
        lon: number;
    };
    readonly country: string;
    readonly id: number;
    readonly name: string;
    readonly population: number;
    readonly sunrise: number;
    readonly sunset: number;
    readonly timezone: number;
}