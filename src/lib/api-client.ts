import ky from "ky";

import { env } from "@/config/env";

// The single configured OpenWeather client. Two things to know before you use it:
//
// 1. `prefixUrl` requires request paths WITHOUT a leading slash — "data/2.5/forecast", never
//    "/data/2.5/forecast" (ky throws on the latter).
// 2. ky deep-merges `searchParams`, which is how `appid` lands on every request. That merge only
//    happens when the per-request `searchParams` is a PLAIN OBJECT. Hand it a URLSearchParams or a
//    string and the merge silently drops `appid`, and the request 401s.
export const openWeatherApi = ky.create({
    prefixUrl: env.VITE_BASE_URL,
    searchParams: { appid: env.VITE_API_KEY },
    timeout: 10_000,
    retry: { limit: 1 },
});
