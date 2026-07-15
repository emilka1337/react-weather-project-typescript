const MS_TO_KMH = 3.6;

export const celsiusToFahrenheit = (celsius: number): number => celsius * (9 / 5) + 32;

export function formatTemperature(celsius: number, inFahrenheit: boolean): string {
    return (inFahrenheit ? celsiusToFahrenheit(celsius) : celsius).toFixed(0);
}

// The two call sites disagreed: wind-container printed "3.0m/s" (one decimal, no space) and
// more-weather-info printed "3 m/s" (no decimals, with a space). One format now, for both.
export function formatWindSpeed(metersPerSecond: number, inMetersPerSecond: boolean): string {
    if (inMetersPerSecond) return `${metersPerSecond.toFixed(1)} m/s`;

    return `${(metersPerSecond * MS_TO_KMH).toFixed(0)} km/h`;
}
