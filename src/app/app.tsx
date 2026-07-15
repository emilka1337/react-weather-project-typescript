import { useEffect } from "react";

import Topbar from "@/app/components/topbar";
import SettingsMenu from "@/features/settings/components/settings-menu";
import DailyForecast from "@/features/weather/components/daily-forecast";
import SelectedWeather from "@/features/weather/components/selected-weather";
import useForecast from "@/features/weather/hooks/use-forecast";
import useTomorrowForecastNotification from "@/features/weather/hooks/use-tomorrow-forecast-notification";
import { useForecastStore } from "@/features/weather/stores/forecast-store";
import useClosePanelOnEscape from "@/hooks/use-close-panel-on-escape";
import useGeolocation from "@/hooks/use-geolocation";
import useNotificationPermission from "@/hooks/use-notification-permission";
import { useSettingsStore } from "@/stores/settings-store";

function App() {
    const darkMode: boolean = useSettingsStore((state) => state.settings.darkMode);
    const forecast = useForecastStore((state) => state.forecast);

    const geolocation = useGeolocation();
    useForecast(geolocation);

    useNotificationPermission();
    useClosePanelOnEscape();
    const showNotification = useTomorrowForecastNotification();

    useEffect(() => {
        if (forecast.length > 0) {
            showNotification();
        }
    }, [forecast, showNotification]);

    return (
        <div className={darkMode ? "app dark" : "app"}>
            <div className="widget">
                <Topbar />
                <SelectedWeather />
                <DailyForecast />
                <SettingsMenu />
            </div>
        </div>
    );
}

export default App;
