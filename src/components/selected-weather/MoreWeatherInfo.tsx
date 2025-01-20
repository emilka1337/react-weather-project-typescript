import React from "react";
import { useSelector } from "react-redux";

const icons = {
    wind: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-wind"
            viewBox="0 0 16 16"
        >
            <path d="M12.5 2A2.5 2.5 0 0 0 10 4.5a.5.5 0 0 1-1 0A3.5 3.5 0 1 1 12.5 8H.5a.5.5 0 0 1 0-1h12a2.5 2.5 0 0 0 0-5m-7 1a1 1 0 0 0-1 1 .5.5 0 0 1-1 0 2 2 0 1 1 2 2h-5a.5.5 0 0 1 0-1h5a1 1 0 0 0 0-2M0 9.5A.5.5 0 0 1 .5 9h10.042a3 3 0 1 1-3 3 .5.5 0 0 1 1 0 2 2 0 1 0 2-2H.5a.5.5 0 0 1-.5-.5" />
        </svg>
    ),
    humidity: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-droplet"
            viewBox="0 0 16 16"
        >
            <path d="M7.21.8C7.69.295 8 0 8 0q.164.544.371 1.038c.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8m.413 1.021A31 31 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10a5 5 0 0 0 10 0c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z" />
            <path d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87z" />
        </svg>
    ),
};

function MoreWeatherInfo() {
    const windSpeed: number = useSelector((state) => state.selectedWeather.selectedWind);
    const speedUnitInMS: boolean = useSelector((state) => state.settings.speedUnitInMS);
    const humidity: number = useSelector((state) => state.selectedWeather.selectedHumidity);
    const sky: string = useSelector((state) => state.selectedWeather.selectedMain);

    const getWindSpeedValue = (): string => {
        let tempWindSpeed = "";

        if (speedUnitInMS === false) {
            tempWindSpeed += (windSpeed * 3.6).toFixed(0);
        } else if (speedUnitInMS === true) {
            tempWindSpeed += windSpeed.toFixed(0);
        }

        tempWindSpeed += speedUnitInMS == false ? " km/h" : " m/s";

        return tempWindSpeed;
    };

    return (
        <div className="more-info">
            <h3 className="wind">
                {icons.wind}
                {getWindSpeedValue()}
            </h3>
            <h2 className="sky">{sky}</h2>
            <h3 className="humidity">
                {icons.humidity}
                {humidity}%
            </h3>
        </div>
    );
}

export default React.memo(MoreWeatherInfo);
