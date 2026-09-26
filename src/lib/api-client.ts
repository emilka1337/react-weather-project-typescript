import ky from "ky";

import { env } from "@/config/env";

// The single configured OpenWeather client. Two things to know before you use it:
//
// 1. Request paths are joined onto `prefix` with exactly one slash (ky 2 trims the boundary), so
//    "data/2.5/forecast" and "/data/2.5/forecast" are the same request. The codebase writes them
//    without the leading slash.
// 2. ky merges `searchParams`, which is how `appid` lands on every request. That merge only
//    happens when the per-request `searchParams` is a PLAIN OBJECT. Hand it a URLSearchParams or a
//    string and it REPLACES the instance's params - `appid` silently disappears and the request 401s.
export const openWeatherApi = ky.create({
    prefix: env.VITE_BASE_URL,
    searchParams: { appid: env.VITE_API_KEY },
    timeout: 10_000,
    retry: { limit: 1 },
});
