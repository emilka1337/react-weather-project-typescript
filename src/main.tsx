import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/app/app";
import ErrorBoundary from "@/components/ui/error-boundary/error-boundary";

import "@/scss/styles.scss";

const rootElem: HTMLElement | null = document.getElementById("root");

if (rootElem) {
    // Zustand stores are module singletons, so there is no Provider to wrap the tree in.
    createRoot(rootElem).render(
        <StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </StrictMode>,
    );
} else {
    throw new Error("Root element not found");
}
