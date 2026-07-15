import { useEffect } from "react";

import { useSettingsStore } from "@/stores/settings-store";

const useNotificationPermission = (): void => {
    const isEnabled: boolean = useSettingsStore((state) => state.settings.showNotifications);

    useEffect(() => {
        if (!isEnabled || Notification.permission !== "default") return;

        Notification.requestPermission()
            .then((permission) => {
                if (permission === "granted") {
                    new Notification("Notifications enabled!");
                }
            })
            .catch((error: unknown) => {
                console.error("Failed to request notification permission: ", error);
            });
    }, [isEnabled]);
};

export default useNotificationPermission;
