import { useEffect } from "react";
import ky from "ky";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { CityGeolocation } from "@/types/geolocation";
import { IPGeolocationSchema } from "@/lib/ip-geolocation";

// Never rejects: the caller runs inside a Geolocation error callback, where a rejected
// promise would surface as an unhandled rejection with nowhere to catch it.
const defineGeolocationByUserIP = async (): Promise<CityGeolocation | null> => {
    try {
        const res = await ky.get("https://ipapi.co/json/");
        const parsedData = IPGeolocationSchema.safeParse(await res.json());

        if (!parsedData.success) {
            console.error("Unexpected IP geolocation response: ", parsedData.error);
            return null;
        }

        return { lat: parsedData.data.latitude, lon: parsedData.data.longitude };
    } catch (error) {
        console.error("IP geolocation error: ", error);
        return null;
    }
};

// Asks user for geolocation permission and sets it in the Redux store and also returns it.
// Falls back to IP-based geolocation when the browser cannot or will not provide coordinates.
const useGeolocation = (): CityGeolocation => {
    const geolocation: CityGeolocation = useGeolocationStore((state) => state.geolocation);
    const setGeolocation = useGeolocationStore((state) => state.setGeolocation);

    useEffect(() => {
        let cancelled: boolean = false;

        const applyGeolocationByUserIP = async (): Promise<void> => {
            const ipGeolocation: CityGeolocation | null = await defineGeolocationByUserIP();

            if (ipGeolocation && !cancelled) {
                setGeolocation(ipGeolocation);
            }
        };

        if (!navigator.geolocation) {
            void applyGeolocationByUserIP();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition): void => {
                if (cancelled) return;

                setGeolocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error: GeolocationPositionError): void => {
                console.error("Geolocation API error: ", error);
                void applyGeolocationByUserIP();
            },
            // Without a timeout the error callback can never fire on a device that simply
            // never returns a fix, and the IP fallback below would never run.
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5 * 60 * 1000 }
        );

        return () => {
            cancelled = true;
        };
    }, [setGeolocation]);

    return geolocation;
};

export default useGeolocation;
