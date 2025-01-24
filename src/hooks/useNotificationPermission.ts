import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../types/State';

const useNotificationPermission = () => {
    const isEnabled: boolean = useSelector((state: ReduxState) => state.settings.showNotifications);

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
