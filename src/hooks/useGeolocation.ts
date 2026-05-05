import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGeolocation } from "../store/geolocationSlice";
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";
import { SearchCity } from "../types/SearchCity";
import ky from "ky";
import z from "zod";
import { IPInfoSchema } from "../entities/IPInfoResponse";

const defineGeolocationByUserIP = async (): Promise<CityGeolocation | void> => {
    const URL = `https://api.ipinfo.io/lite/me?token=${import.meta.env.VITE_IPINFO_API_TOKEN}`;
    const res = await ky.get(URL);
    const data = await res.json()
    const parsedData = z.safeParse(IPInfoSchema, data);

    if (parsedData.success) {
        const URL = `${import.meta.env.VITE_BASE_URL
            }/geo/1.0/direct?q=${parsedData.data.country}&limit=3&appid=${import.meta.env.VITE_API_KEY}`;

        try {
            const res = await ky.get<SearchCity[]>(URL);
            const data = await res.json();

            if (!data[0]) return;

            return {
                lat: data[0]?.lat,
                lon: data[0]?.lon
            }
        } catch (err) {
            console.error(err);
        }
    }
}

// Asks user for geolocation permission and sets it in the Redux store and also returns it
const useGeolocation = (): CityGeolocation => {
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const dispatch = useDispatch();

    const getGeolocation = async () => {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition): void => {
                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                )
            },
            async (error: GeolocationPositionError): Promise<void> => {
                console.error("Geolocation API error: ", error);

                const geolocation: CityGeolocation | void = await defineGeolocationByUserIP()

                if (geolocation) {
                    setGeolocation({
                        lat: geolocation.lat,
                        lon: geolocation.lon
                    })
                }
            },
            { enableHighAccuracy: true }
        );
    }

    useEffect(() => {
        getGeolocation()
    }, []);

    return geolocation;
}

export default useGeolocation