import { useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

// Escape closes whichever overlay panel is open - a standard keyboard expectation for overlays.
// The listener is only attached while a panel is actually open.
export default function useClosePanelOnEscape(): void {
    const closePanel = useUiStore((state) => state.closePanel);
    const panelOpen = useUiStore((state) => state.activePanel !== "none");

    useEffect(() => {
        if (!panelOpen) return;

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") closePanel();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [panelOpen, closePanel]);
}
