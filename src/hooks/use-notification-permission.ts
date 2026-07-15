import { useEffect } from "react";

import { isExtension } from "@/lib/extension";
import { useSettingsStore } from "@/stores/settings-store";

const useNotificationPermission = (): void => {
    const isEnabled: boolean = useSettingsStore((state) => state.settings.showNotifications);

    useEffect(() => {
        // In the extension the manifest "notifications" permission already grants chrome.notifications,
        // and the web permission prompt on a chrome-extension:// origin is unwanted. Pages only.
        if (isExtension() || !isEnabled || Notification.permission !== "default") return;

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
