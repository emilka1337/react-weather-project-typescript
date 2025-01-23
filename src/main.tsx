import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { Provider } from "react-redux";
import store from "./store/store";
// Styles
import "./scss/styles.scss";

const rootElem: HTMLElement | null = document.getElementById("root");

if (rootElem) {
    ReactDOM.createRoot(rootElem).render(
        <React.StrictMode>
            <Provider store={store}>
                <App />
            </Provider>
        </React.StrictMode>
    );
} else {
    throw new Error("Root element not found")
}