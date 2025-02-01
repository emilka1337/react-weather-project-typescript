import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGeolocation } from "../store/geolocationSlice";
import { CityGeolocation } from "../types/CityGeolocation";
import { ReduxState } from "../types/State";

// Asks user for geolocation permission and sets it in the Redux store and also returns it
const useGeolocation = (): CityGeolocation | null => {
    const geolocation: CityGeolocation = useSelector((state: ReduxState) => state.geolocation);
    const dispatch = useDispatch();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition): void => {
                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                )
            },
            (error: GeolocationPositionError): void => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    return geolocation;
}

export default useGeolocation