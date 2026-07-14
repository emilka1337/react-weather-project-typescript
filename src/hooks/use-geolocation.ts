import { useEffect } from "react";

import { getGeolocationByIp } from "@/lib/ip-geolocation";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { CityGeolocation } from "@/types/geolocation";

// Asks the browser for coordinates and writes them to the shared geolocation store. Falls back to
// IP-based geolocation when the browser cannot or will not provide them.
//
// The store is the seam the whole app hangs off: `city` writes coordinates into it when a city is
// picked, `weather` reacts to them. The two features never import each other.
const useGeolocation = (): CityGeolocation => {
    const geolocation: CityGeolocation = useGeolocationStore((state) => state.geolocation);
    const setGeolocation = useGeolocationStore((state) => state.setGeolocation);

    useEffect(() => {
        let cancelled = false;

        const applyGeolocationByIp = async (): Promise<void> => {
            const ipGeolocation = await getGeolocationByIp();

            if (ipGeolocation && !cancelled) {
                setGeolocation(ipGeolocation);
            }
        };

        if (!navigator.geolocation) {
            void applyGeolocationByIp();
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
                void applyGeolocationByIp();
            },
            // Without a timeout the error callback can never fire on a device that simply never
            // returns a fix, and the IP fallback would never run.
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5 * 60 * 1000 }
        );

        return () => {
            cancelled = true;
        };
    }, [setGeolocation]);

    return geolocation;
};

export default useGeolocation;
