import { useDispatch, useSelector } from "react-redux";
import { setForecastMode } from "../../store/forecastModeSlice";
import { ForecastModes } from "../../enums/ForecastMode";
import { ReduxState } from "../../types/State";
import { Dispatch } from "@reduxjs/toolkit";
import { AppDispatch } from "../../store/store";

function ForecastModeTogglePanel() {
    const forecastMode: ForecastModes = useSelector((state: ReduxState) => state.forecastMode)
    const dispatch: AppDispatch = useDispatch();

    const temperatureButtonClick: Dispatch = () => dispatch(setForecastMode("temperature"));
    const windButtonClick: Dispatch = () => dispatch(setForecastMode("wind"));

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
                        onClick={temperatureButtonClick}
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
                            forecastMode == "wind"
                                ? "forecast-mode-toggler active"
                                : "forecast-mode-toggler"
                        }
                        onClick={windButtonClick}
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
            </ul>
        </nav>
    );
}

export default ForecastModeTogglePanel;
