import ky from "ky";
import { z } from "zod";

import { CityGeolocation } from "@/types/geolocation";

// ipapi.co returns coordinates directly, so no geocoding round-trip is needed. It is a different
// host from OpenWeather, so it does not go through openWeatherApi. Only the fields we read are
// declared; zod strips the rest, so extra fields upstream can never fail the parse.
const IpGeolocationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string().optional(),
});

// Never rejects. The caller runs inside a Geolocation error callback, where a rejected promise has
// nowhere to be caught and would surface as an unhandled rejection.
export async function getGeolocationByIp(): Promise<CityGeolocation | null> {
    try {
        const parsed = IpGeolocationSchema.safeParse(await ky.get("https://ipapi.co/json/").json());

        if (!parsed.success) {
            console.error("Unexpected IP geolocation response: ", parsed.error);
            return null;
        }

        return { lat: parsed.data.latitude, lon: parsed.data.longitude };
    } catch (error) {
        console.error("IP geolocation error: ", error);
        return null;
    }
}
