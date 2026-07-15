import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import Spinner from "@/components/ui/spinner/spinner";
import { useSettingsStore } from "@/stores/settings-store";

describe("Spinner", () => {
    it("animates by default", () => {
        const { container } = render(<Spinner />);

        expect(container.querySelectorAll(".circle")).toHaveLength(2);
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("falls back to plain text when the loading animation is switched off", () => {
        act(() => useSettingsStore.getState().toggleLoadingAnimation());

        const { container } = render(<Spinner />);

        expect(container.querySelectorAll(".circle")).toHaveLength(0);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
});
