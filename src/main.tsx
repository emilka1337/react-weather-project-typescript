import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/app/app";
import ErrorBoundary from "@/components/ui/error-boundary/error-boundary";
// Styles
import "./scss/styles.scss";

const rootElem: HTMLElement | null = document.getElementById("root");

if (rootElem) {
    // Zustand stores are module singletons, so there is no Provider to wrap the tree in.
    ReactDOM.createRoot(rootElem).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    throw new Error("Root element not found")
}
