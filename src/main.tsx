import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
// Styles
import "./scss/styles.scss";

const rootElem: HTMLElement | null = document.getElementById("root");

if (rootElem) {
    // Zustand stores are module singletons, so there is no Provider to wrap the tree in.
    ReactDOM.createRoot(rootElem).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    throw new Error("Root element not found")
}
