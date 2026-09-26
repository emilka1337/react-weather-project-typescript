import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useNotificationPermission from "@/hooks/use-notification-permission";
import { useSettingsStore } from "@/stores/settings-store";

// A web Notification stand-in: records every notification constructed and lets each test pick the
// current permission and what the permission prompt resolves to.
const mockNotifications = (
    permission: NotificationPermission,
    prompt: () => Promise<NotificationPermission>,
) => {
    const fired: string[] = [];
    const requestPermission = vi.fn<() => Promise<NotificationPermission>>(prompt);

    class MockNotification {
        static permission = permission;
        static requestPermission = requestPermission;
        constructor(title: string) {
            fired.push(title);
        }
    }

    vi.stubGlobal("Notification", MockNotification);
    return { fired, requestPermission };
};

const enableNotifications = (): void => {
    act(() => useSettingsStore.getState().toggleNotifications());
};

describe("useNotificationPermission", () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, "chrome");
    });

    it("does not prompt while notifications are switched off", () => {
        const { requestPermission } = mockNotifications("default", () => Promise.resolve("granted"));

        renderHook(() => useNotificationPermission());

        expect(requestPermission).not.toHaveBeenCalled();
    });

    it("prompts once enabled, and confirms with a notification when granted", async () => {
        const { fired, requestPermission } = mockNotifications("default", () => Promise.resolve("granted"));
        renderHook(() => useNotificationPermission());

        enableNotifications();

        expect(requestPermission).toHaveBeenCalledOnce();
        await waitFor(() => expect(fired).toEqual(["Notifications enabled!"]));
    });

    it("stays quiet when the user declines the prompt", async () => {
        const { fired, requestPermission } = mockNotifications("default", () => Promise.resolve("denied"));
        enableNotifications();

        renderHook(() => useNotificationPermission());

        await waitFor(() => expect(requestPermission).toHaveBeenCalledOnce());
        await Promise.resolve();
        expect(fired).toEqual([]);
    });

    it.each(["granted", "denied"] as const)(
        "does not prompt again once the permission is already %s",
        (permission) => {
            const { requestPermission } = mockNotifications(permission, () => Promise.resolve(permission));
            enableNotifications();

            renderHook(() => useNotificationPermission());

            expect(requestPermission).not.toHaveBeenCalled();
        },
    );

    it("logs, rather than throws, when the permission request fails", async () => {
        const error = new Error("prompt blocked");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mockNotifications("default", () => Promise.reject(error));
        enableNotifications();

        renderHook(() => useNotificationPermission());

        await waitFor(() =>
            expect(consoleError).toHaveBeenCalledWith("Failed to request notification permission: ", error),
        );
    });

    it("never prompts inside the extension - the manifest permission covers chrome.notifications", () => {
        const { requestPermission } = mockNotifications("default", () => Promise.resolve("granted"));
        (globalThis as { chrome?: unknown }).chrome = { runtime: { id: "abc123" } };
        enableNotifications();

        renderHook(() => useNotificationPermission());

        expect(requestPermission).not.toHaveBeenCalled();
    });
});
