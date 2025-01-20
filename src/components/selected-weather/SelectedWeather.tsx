import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWeather } from "../../store/selectedWeatherSlice";
import Loading from "./Loading";
import SelectedTemperature from "./SelectedTemperature";
import FeelsLikeField from "./FeelsLikeField";
import MoreWeatherInfo from "./MoreWeatherInfo";
import { ForecastData } from "../App";

function SelectedWeather() {
    const dispatch = useDispatch();
    const showFeelsLikeField: boolean = useSelector((state) => state.settings.showFeelsLikeField);
    const forecast: ForecastData = useSelector((state) => state.forecast);

    // Setting main displaying weather to current weather
    useEffect(() => {
        if (forecast.list[0]) {
            dispatch(setSelectedWeather(forecast.list[0]));
        }
    }, [forecast]);

    if (forecast.list.length > 0) {
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
