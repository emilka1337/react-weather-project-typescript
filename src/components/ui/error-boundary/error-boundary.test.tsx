import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "@/components/ui/error-boundary/error-boundary";

function Boom(): never {
    throw new Error("boom");
}

describe("ErrorBoundary", () => {
    it("renders its children when nothing throws", () => {
        render(
            <ErrorBoundary>
                <p>all good</p>
            </ErrorBoundary>
        );

        expect(screen.getByText("all good")).toBeInTheDocument();
    });

    it("shows a recoverable fallback instead of a blank screen when a child throws", () => {
        // React re-throws and logs the caught error; silence that so the run output stays clean.
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );

        expect(screen.getByRole("alert")).toHaveTextContent("Sorry, something went wrong");
    });
});
