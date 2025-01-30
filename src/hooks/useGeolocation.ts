import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setGeolocation } from "../store/geolocationSlice";

const useGeolocation = (): void => {
    const dispatch = useDispatch();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition): void => {
                dispatch(
                    setGeolocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                );
            },
            (error: GeolocationPositionError): void => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );
    }, []);
}

export default useGeolocation