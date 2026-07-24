import { z } from "zod";

import { ForecastUnitSchema } from "@/features/weather/types/forecast-unit";

// Only `list` is consumed. The API also returns city/cnt/cod; zod strips them, so the cache stores
// just what the app uses. Parsed and validated at the boundary in features/weather/api/get-forecast.
export const ForecastSchema = z.object({
    list: z.array(ForecastUnitSchema),
});

export type ForecastData = z.infer<typeof ForecastSchema>;
