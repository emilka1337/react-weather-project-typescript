import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWeather } from "../../store/selectedWeatherSlice";
import Loading from "./Loading";
import SelectedTemperature from "./SelectedTemperature";
import FeelsLikeField from "./FeelsLikeField";
import MoreWeatherInfo from "./MoreWeatherInfo";
import { ReduxState } from "../../types/State";
import { AppDispatch } from "../../store/store";
import { ForecastUnit } from "../../types/ForecastUnit";

function SelectedWeather() {
    const dispatch: AppDispatch = useDispatch();
    const showFeelsLikeField: boolean = useSelector((state: ReduxState) => state.settings.showFeelsLikeField);
    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);

    console.log(forecast);

    // Setting main displaying weather to current weather
    useEffect(() => {
        if (forecast[0]) {
            dispatch(setSelectedWeather(forecast[0]));
        }
    }, [forecast]);

    if (forecast.length > 0) {
        return (
            <div className="selected-weather">
                <SelectedTemperature />
                {showFeelsLikeField && <FeelsLikeField />}
                <MoreWeatherInfo />
            </div>
        );
    } else {
        return <Loading />;
    }
}

export default React.memo(SelectedWeather);
