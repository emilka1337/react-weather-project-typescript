import { useCallback } from "react";

import { useForecastStore } from "@/features/weather/stores/forecast-store";
import { CommonForecastByDay } from "@/features/weather/types/common-forecast-by-day";
import { ForecastUnit } from "@/features/weather/types/forecast-unit";
import { separateListByWeekdays } from "@/features/weather/utils/separate-list-by-weekdays";
import { useSettingsStore } from "@/stores/settings-store";

function summariseDay(forecastDay: readonly ForecastUnit[] | undefined): CommonForecastByDay | undefined {
    // Math.min(...[]) is Infinity, so an empty day must not reach the spread.
    if (!forecastDay?.length) return undefined;

    return {
        minTemp: Math.min(...forecastDay.map((unit) => unit.main.temp)),
        maxTemp: Math.max(...forecastDay.map((unit) => unit.main.temp)),
        maxWind: Math.max(...forecastDay.map((unit) => unit.wind.speed)),
    };
}

function showNotification(tomorrowForecast: CommonForecastByDay): Notification {
    return new Notification("Tomorrow's weather", {
        body:
            `💨Max wind: ${(tomorrowForecast.maxWind * 3.6).toFixed(0)} km/h\n` +
            `🔥Max temperature: ${tomorrowForecast.maxTemp.toFixed(0)}°\n` +
            `❄Min temperature: ${tomorrowForecast.minTemp.toFixed(0)}°`,
        icon: "https://icons.iconarchive.com/icons/dtafalonso/win-10x/512/Weather-icon.png",
        badge: "https://icons.veryicon.com/png/o/miscellaneous/test-6/weather-91.png",
    });
}

// Returns a stable callback, so the caller's effect can depend on it without re-firing every render.
export default function useTomorrowForecastNotification(): () => void {
    const forecast: ForecastUnit[] = useForecastStore((state) => state.forecast);
    const notificationsEnabled: boolean = useSettingsStore((state) => state.settings.showNotifications);

    return useCallback(() => {
        if (!notificationsEnabled || Notification.permission !== "granted" || !forecast.length) return;

        const tomorrow = summariseDay(separateListByWeekdays(forecast)[1]);

        if (tomorrow) showNotification(tomorrow);
    }, [forecast, notificationsEnabled]);
}
