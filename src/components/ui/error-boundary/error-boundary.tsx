import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    readonly children: ReactNode;
}

interface ErrorBoundaryState {
    readonly hasError: boolean;
}

// Without this, any throw during render tears down the whole tree - in the extension popup that is a
// blank window with no way back. It catches the throw and shows a recoverable fallback instead. It
// is a class because getDerivedStateFromError / componentDidCatch have no hook equivalent.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("Unhandled render error:", error, info);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="error-fallback" role="alert">
                    <h3>Sorry, something went wrong :(</h3>
                    <p>Try reopening the widget, or use “Reset App” in settings.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
