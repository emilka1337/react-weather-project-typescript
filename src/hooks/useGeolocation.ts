import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ky from "ky";
import { setGeolocation } from "../store/geolocationSlice";
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";
import { IPGeolocationSchema } from "../entities/IPGeolocationResponse";

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
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const dispatch = useDispatch();

    useEffect(() => {
        let cancelled: boolean = false;

        const applyGeolocationByUserIP = async (): Promise<void> => {
            const ipGeolocation: CityGeolocation | null = await defineGeolocationByUserIP();

            if (ipGeolocation && !cancelled) {
                dispatch(setGeolocation(ipGeolocation));
            }
        };

        if (!navigator.geolocation) {
            void applyGeolocationByUserIP();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition): void => {
                if (cancelled) return;

                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                );
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
    }, [dispatch]);

    return geolocation;
};

export default useGeolocation;
