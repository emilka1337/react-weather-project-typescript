import { useState } from "react";
import { useSelector } from "react-redux";
import { Alert } from "../../types/Alert";
import { ReduxState } from "../../types/State";

function WarningAlert() {
    let [showAlert, setShowAlert] = useState<boolean>(false);

    const warnings: Alert[] = useSelector((state: ReduxState) => state.alerts.warnings);

    const hideAlert = (): void => setShowAlert(false);

    return warnings.map((warning: Alert, index: number) => {
        <div className={showAlert ? "alert show" : "alert"} key={index}>
            <h3>Something went wrong :(</h3>
            <p>
                <span>Error Name/Code:</span> {`${warning.name ?? warning.code}`}
            </p>
            <p>
                <span>Error message:</span> {`${warning.message}`}
            </p>
            <button onClick={hideAlert}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="bi bi-x-lg"
                    viewBox="0 0 16 16"
                >
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
            </button>
        </div>;
    });
}

export default WarningAlert;
