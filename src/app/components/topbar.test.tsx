import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Topbar from "@/app/components/topbar";

// Topbar is pure composition of three features (city, clock, settings) - the one place that is
// allowed to put them side by side. This pins the composition, not the features themselves.
describe("Topbar", () => {
    it("composes the city name, the clock and the settings toggle", () => {
        const { container } = render(<Topbar />);

        expect(container.querySelector(".topbar .city")).toBeInTheDocument();
        expect(container.querySelector(".topbar-right .greeting")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search for a city" })).toBeInTheDocument();
    });
});
