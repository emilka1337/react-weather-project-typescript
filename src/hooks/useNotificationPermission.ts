import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

const useNotificationPermission = () => {
    const isEnabled: boolean = useSettingsStore((state) => state.settings.showNotifications);

    useEffect(() => {
        if (isEnabled && Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    new Notification("Notifications enabled!");
                }
            });
        }
    }, [isEnabled]);
}


export default useNotificationPermission;
