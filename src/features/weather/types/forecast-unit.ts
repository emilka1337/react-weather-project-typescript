import { z } from "zod";

// The schema is the source of truth; the type is inferred from it, so the two can never drift and
// the app validates external data at the boundary instead of trusting a hand-written cast.
//
// Only the fields the app actually reads are declared - zod strips the rest, so extra fields from
// OpenWeather never fail the parse. `weekday` is stamped locally by separateListByWeekdays, not sent
// by the API, hence optional. `weather` must have at least one entry, because weather[0].main is read.
export const ForecastUnitSchema = z.object({
    dt: z.number(),
    main: z.object({
        temp: z.number(),
        feels_like: z.number(),
        humidity: z.number(),
    }),
    wind: z.object({
        speed: z.number(),
        deg: z.number(),
    }),
    weather: z.array(z.object({ main: z.string() })).min(1),
    weekday: z.number().optional(),
});

export type ForecastUnit = z.infer<typeof ForecastUnitSchema>;
