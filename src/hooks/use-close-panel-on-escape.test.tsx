import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import useClosePanelOnEscape from "@/hooks/use-close-panel-on-escape";
import { useUiStore } from "@/stores/ui-store";

function Harness() {
    useClosePanelOnEscape();
    return null;
}

describe("useClosePanelOnEscape", () => {
    it("closes an open panel when Escape is pressed", async () => {
        const user = userEvent.setup();
        act(() => useUiStore.getState().openPanel("settings"));
        render(<Harness />);

        await user.keyboard("{Escape}");

        expect(useUiStore.getState().activePanel).toBe("none");
    });

    it("closes the city-search panel too", async () => {
        const user = userEvent.setup();
        act(() => useUiStore.getState().openPanel("city-search"));
        render(<Harness />);

        await user.keyboard("{Escape}");

        expect(useUiStore.getState().activePanel).toBe("none");
    });

    it("does nothing when no panel is open", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.keyboard("{Escape}");

        expect(useUiStore.getState().activePanel).toBe("none");
    });

    it("ignores other keys", async () => {
        const user = userEvent.setup();
        act(() => useUiStore.getState().openPanel("settings"));
        render(<Harness />);

        await user.keyboard("a");

        expect(useUiStore.getState().activePanel).toBe("settings");
    });
});
