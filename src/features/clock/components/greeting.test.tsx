import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Greeting from "@/features/clock/components/greeting";

describe("Greeting", () => {
    it.each([
        [0, "Good Night"],
        [5, "Good Night"],
        [6, "Good Morning"],
        [11, "Good Morning"],
        [12, "Have a nice day"],
        [17, "Have a nice day"],
        [18, "Good Evening"],
        [23, "Good Evening"],
    ])("greets with %s at hour %i", (hours, expected) => {
        render(<Greeting time={{ hours, minutes: 0 }} />);

        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it("moves on to the next greeting as the hour passes", () => {
        const { rerender } = render(<Greeting time={{ hours: 11, minutes: 59 }} />);

        rerender(<Greeting time={{ hours: 12, minutes: 0 }} />);

        expect(screen.getByText("Have a nice day")).toBeInTheDocument();
        expect(screen.queryByText("Good Morning")).not.toBeInTheDocument();
    });

    it("renders an empty greeting for an hour outside 0-23 rather than a wrong one", () => {
        render(<Greeting time={{ hours: 24, minutes: 0 }} />);

        expect(screen.getByRole("heading")).toBeEmptyDOMElement();
    });
});
