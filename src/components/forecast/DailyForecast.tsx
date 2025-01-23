import React, { useEffect, useState } from "react";
import ForecastDay from "./ForecastDay";
import ForecastModeTogglePanel from "./ForecastModeTogglePanel";
import { useSelector } from "react-redux";
import { ForecastUnit } from "../../types/ForecastUnit";
import { CommonForecastByDay } from "../../types/CommonForecastByDay";
import { ReduxState } from "../../types/State";

function extractWeekDayFromTimestamp(ts: number): number {
    return new Date(ts * 1000).getDay();
}

function countElementsInArrayOfArrays(arr: Array<Array<unknown>>): number {
    let result = 0;

    for (const elem of arr) {
        result += elem.length;
    }

    return result;
}

function separateListByWeekdays(list: ForecastUnit[]): Array<Array<ForecastUnit>> | [] {
    if (!list.length) return [];

    const newList: ForecastUnit[] = structuredClone(list);
    newList.map((item: ForecastUnit) => (item.weekday = extractWeekDayFromTimestamp(item.dt)));

    const result: Array<Array<ForecastUnit>> = [];

    let currentWeekday: number | undefined = newList[0].weekday;

    while (countElementsInArrayOfArrays(result) < 40) {
        result.push(newList.filter((item) => item.weekday == currentWeekday));

        if (currentWeekday && currentWeekday < 6) {
            currentWeekday++;
        } else {
            currentWeekday = 0;
        }
    }

    return result;
}

function getCommonForecastByDay(forecastDay: readonly ForecastUnit[]): CommonForecastByDay {
    const minTemp = Math.min(...forecastDay.map((item) => item.main.temp));
    const maxTemp = Math.max(...forecastDay.map((item) => item.main.temp));
    const maxWind = Math.max(...forecastDay.map((item) => item.wind.speed));

    return { minTemp, maxTemp, maxWind };
}

function showTomorrowforecastNotification(tomorrowForecast: CommonForecastByDay): Notification {
    return new Notification("Tomorrow's weather", {
        body: `💨Max wind: ${(tomorrowForecast.maxWind * 3.6).toFixed(
            0
        )} km/h\n🔥Max temperature: ${tomorrowForecast.maxTemp.toFixed(
            0
        )}°\n❄Min temperature: ${tomorrowForecast.minTemp.toFixed(0)}°`,
        icon: "https://icons.iconarchive.com/icons/dtafalonso/win-10x/512/Weather-icon.png",
        badge: "https://icons.veryicon.com/png/o/miscellaneous/test-6/weather-91.png",
    });
}

function DailyForecast() {
    const [notificationShowed, setNotificationShowed] = useState<boolean>(false);
    const [notificationsPermission, setNotificationsPermission] = useState<string>("denied");
    const [separatedForecastList, setseparatedForecastList] = useState<ReadonlyArray<ReadonlyArray<ForecastUnit>>>([]);

    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);

    useEffect(() => {
        Notification.requestPermission().then((result) => {
            setNotificationsPermission(result);
        });
        // .catch((error) => {
        // setError(error);
        // });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (forecast.length > 0) {
            setseparatedForecastList(separateListByWeekdays(forecast));
        }
    }, [forecast]);

    useEffect(() => {
        if (
            notificationsPermission == "granted" &&
            notificationShowed === false &&
            separatedForecastList.length > 0
        ) {
            const tomorrowForecast: CommonForecastByDay = getCommonForecastByDay(separatedForecastList[1]);
            setNotificationShowed(true);
            setTimeout(function () {
                showTomorrowforecastNotification(tomorrowForecast);
            }, 5000);

            console.log("notification");
        }
    }, [notificationShowed, notificationsPermission, separatedForecastList]);

    if (separatedForecastList.length > 0) {
        return (
            <>
                <ForecastModeTogglePanel />
                <ul className="daily-forecast">
                    {separatedForecastList.map((day: readonly ForecastUnit[], index: number) => {
                        return <ForecastDay day={day} weekday={day[0].weekday || new Date().getDay()} key={index} index={index} />;
                    })}
                </ul>
            </>
        );
    }
}

export default React.memo(DailyForecast);
