import { useSelector } from "react-redux";
import { CommonForecastByDay } from "../types/CommonForecastByDay";
import { ForecastUnit } from "../types/ForecastUnit";
import { ReduxState } from "../types/State";
import { separateListByWeekdays } from "../components/forecast/DailyForecast";

function getCommonForecastByDay(forecastDay: readonly ForecastUnit[]): CommonForecastByDay | undefined {
    if (!forecastDay) return
    console.log("forecastDay: ", forecastDay);
    const minTemp = Math.min(...forecastDay.map((item) => item.main.temp));
    const maxTemp = Math.max(...forecastDay.map((item) => item.main.temp));
    const maxWind = Math.max(...forecastDay.map((item) => item.wind.speed));

    return { minTemp, maxTemp, maxWind };
}

function showTomorrowforecastNotification(tomorrowForecast: CommonForecastByDay): Notification {
    console.log("Showing tomorrow forecast notification");
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

type useNotificationType = () => void;

export default function useNotification(): useNotificationType {
    // const [notificationShowed, setNotificationShowed] = useState<boolean>(false);
    const forecast: ForecastUnit[] = useSelector((state: ReduxState) => state.forecast);
    const tomorrowForecast: CommonForecastByDay | undefined = getCommonForecastByDay(separateListByWeekdays(forecast)[1]) || undefined;
    const notificationPermission: boolean = useSelector((state: ReduxState) => state.settings.showNotifications);

    const showTomorrowForecastNotification = () => {
        if (
            notificationPermission &&
            Notification.permission === "granted" &&
            forecast.length > 0
        ) {
            // setNotificationShowed(true);
            if (tomorrowForecast) {
                showTomorrowforecastNotification(tomorrowForecast);
            }
        }
    };

    return showTomorrowForecastNotification
}