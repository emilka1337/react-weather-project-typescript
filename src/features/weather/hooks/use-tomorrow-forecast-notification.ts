import { CommonForecastByDay } from "@/features/weather/types/common-forecast-by-day";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { useSettingsStore } from "@/stores/settings-store";
import { separateListByWeekdays } from "@/features/weather/components/daily-forecast";

function getCommonForecastByDay(forecastDay: readonly ForecastUnit[]): CommonForecastByDay | undefined {
    if (!forecastDay) return
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

type useDesktopNotificationType = () => void;

export default function useDesktopNotification(): useDesktopNotificationType {
    // const [notificationShowed, setNotificationShowed] = useState<boolean>(false);
    const forecast: ForecastUnit[] = useForecastStore((state) => state.forecast);
    const tomorrowForecast: CommonForecastByDay | undefined = getCommonForecastByDay(separateListByWeekdays(forecast)[1]) || undefined;
    const notificationPermission: boolean = useSettingsStore((state) => state.settings.showNotifications);

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