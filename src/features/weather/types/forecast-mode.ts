// A const object + a same-named union type instead of an enum: enums are not erasable syntax, and
// the project compiles with erasableSyntaxOnly. Call sites read the same (ForecastModes.WIND).
export const ForecastModes = {
    TEMPERATURE: "temperature",
    WIND: "wind",
    HUMIDITY: "humidity",
} as const;

export type ForecastModes = (typeof ForecastModes)[keyof typeof ForecastModes];
