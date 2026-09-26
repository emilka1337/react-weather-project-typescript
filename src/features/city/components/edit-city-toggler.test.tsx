import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EditCityToggler from "@/features/city/components/edit-city-toggler";

describe("EditCityToggler", () => {
    it("is an icon button named for what it does, and calls the current handler", async () => {
        const first = vi.fn<() => void>();
        const second = vi.fn<() => void>();
        const user = userEvent.setup();
        const { rerender } = render(<EditCityToggler onClick={first} />);

        await user.click(screen.getByRole("button", { name: "Search for a city" }));
        rerender(<EditCityToggler onClick={second} />);
        await user.click(screen.getByRole("button", { name: "Search for a city" }));

        expect(first).toHaveBeenCalledOnce();
        expect(second).toHaveBeenCalledOnce();
    });
});
