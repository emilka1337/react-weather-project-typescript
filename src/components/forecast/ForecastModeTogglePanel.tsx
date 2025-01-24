import { useDispatch, useSelector } from "react-redux";
import { setForecastMode } from "../../store/forecastModeSlice";
import { ForecastModes } from "../../enums/ForecastMode";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";

function ForecastModeTogglePanel() {
    const forecastMode: ForecastModes = useSelector((state: ReduxState) => state.forecastMode);
    const dispatch: AppDispatch = useDispatch();

    const handleForecastModeChange = (mode: ForecastModes): void => {
        dispatch(setForecastMode(mode));
    };

    return (
        <nav className="forecast-mode-toggle-panel">
            <ul>
                <li>
                    <button
                        className={
                            forecastMode == "temperature"
                                ? "forecast-mode-toggler active"
                                : "forecast-mode-toggler"
                        }
                        onClick={() => handleForecastModeChange(ForecastModes.TEMPERATURE)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            className="bi bi-thermometer-half"
                            viewBox="0 0 16 16"
                        >
                            <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415" />
                            <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1" />
                        </svg>
                    </button>
                </li>
                <li>
                    <button
                        className={
                            forecastMode == "wind" ? "forecast-mode-toggler active" : "forecast-mode-toggler"
                        }
                        onClick={() => handleForecastModeChange(ForecastModes.WIND)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            className="bi bi-wind"
                            viewBox="0 0 16 16"
                        >
                            <path d="M12.5 2A2.5 2.5 0 0 0 10 4.5a.5.5 0 0 1-1 0A3.5 3.5 0 1 1 12.5 8H.5a.5.5 0 0 1 0-1h12a2.5 2.5 0 0 0 0-5m-7 1a1 1 0 0 0-1 1 .5.5 0 0 1-1 0 2 2 0 1 1 2 2h-5a.5.5 0 0 1 0-1h5a1 1 0 0 0 0-2M0 9.5A.5.5 0 0 1 .5 9h10.042a3 3 0 1 1-3 3 .5.5 0 0 1 1 0 2 2 0 1 0 2-2H.5a.5.5 0 0 1-.5-.5" />
                        </svg>
                    </button>
                </li>
                <li>
                    <button
                        className={
                            forecastMode == "humidity"
                                ? "forecast-mode-toggler active"
                                : "forecast-mode-toggler"
                        }
                        onClick={() => handleForecastModeChange(ForecastModes.HUMIDITY)}
                    >
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
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default ForecastModeTogglePanel;
